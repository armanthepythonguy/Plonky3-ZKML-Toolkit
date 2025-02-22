use std::{fs::File, io::Read, marker::PhantomData};

use p3_air::{Air, AirBuilder, AirBuilderWithPublicValues, BaseAir};
use p3_challenger::{HashChallenger, SerializingChallenger32};
use p3_circle::CirclePcs;
use p3_commit::ExtensionMmcs;
use p3_field::{extension::BinomialExtensionField, Field, FieldAlgebra, PrimeField32};
use p3_fri::FriConfig;
use p3_keccak::Keccak256Hash;
use p3_matrix::{dense::RowMajorMatrix, Matrix};
use p3_merkle_tree::MerkleTreeMmcs;
use p3_mersenne_31::Mersenne31;
use p3_symmetric::{CompressionFunctionFromHasher, SerializingHasher32};
use p3_uni_stark::{prove, verify, Proof, StarkConfig};

use crate::vm::VM;

pub struct VMAir {}

impl<F: Field> BaseAir<F> for VMAir {
    fn width(&self) -> usize {
        9
    }
}

impl<AB: AirBuilderWithPublicValues> Air<AB> for VMAir {
    fn eval(&self, builder: &mut AB) {
        let main = builder.main();
        let pis = builder.public_values();
        let local = main.row_slice(0);
        let next = main.row_slice(1);

        let target = pis[0];

        builder.when_first_row().assert_zero(
            local[0]
                + local[1]
                + local[2]
                + local[3]
                + local[4]
                + local[5]
                + local[6]
                + local[7]
                + local[8]
        );

        //Constraints for add computation
        builder
            .when_transition()
            .assert_zero(next[6] * (next[0] - local[0] - local[1]));
        builder
            .when_transition()
            .assert_zero(next[6] * (next[1] - local[2]));

        //Constraints for sub computation
        builder
            .when_transition()
            .assert_zero(next[7] * (local[0] - local[1] - next[0]));

        //Constraint for mul computation
        builder
            .when_transition()
            .assert_zero(next[8] * (local[0] * local[1] - next[0]));

        //Constraints for push computation
        builder.when_transition().assert_zero(
            next[5]
                * ((next[0] - next[4])
                    + (local[0] - next[1])
                    + (local[1] - next[2])
                    + (local[2] - next[3])),
        );

        builder
            .when_transition()
            .assert_zero((next[6] + next[7] + next[8]) * (next[1] - local[2]));

        builder.when_last_row().assert_eq(local[0], target);

        
    }
}

impl VMAir {
    pub fn generate_proof(&self, vm: VM, target: Mersenne31) {
        type Val = Mersenne31;
        type Challenge = BinomialExtensionField<Val, 3>;
        type ByteHash = Keccak256Hash;
        type FieldHash = SerializingHasher32<ByteHash>;
        let byte_hash = ByteHash {};
        let field_hash = FieldHash::new(byte_hash);

        type MyCompress = CompressionFunctionFromHasher<ByteHash, 2, 32>;
        let compress = MyCompress::new(byte_hash);

        type ValMmcs = MerkleTreeMmcs<Val, u8, FieldHash, MyCompress, 32>;
        let val_mmcs = ValMmcs::new(field_hash, compress);

        type ChallengeMmcs = ExtensionMmcs<Val, Challenge, ValMmcs>;
        let challenge_mmcs = ChallengeMmcs::new(val_mmcs.clone());

        type Challenger = SerializingChallenger32<Val, HashChallenger<u8, ByteHash, 32>>;
        let mut challenger = Challenger::from_hasher(vec![], byte_hash);

        let fri_config = FriConfig {
            log_blowup: 1,
            num_queries: 40,
            proof_of_work_bits: 8,
            mmcs: challenge_mmcs,
        };

        type Pcs = CirclePcs<Val, ValMmcs, ChallengeMmcs>;
        let pcs = Pcs {
            mmcs: val_mmcs,
            fri_config,
            _phantom: PhantomData,
        };

        type MyConfig = StarkConfig<Pcs, Challenge, Challenger>;
        let config = MyConfig::new(pcs);

        let trace = get_trace(vm);
        let proof = prove(&config, self, &mut challenger, trace, &vec![target]);
        verify(&config, self, &mut challenger, &proof, &vec![target]);
    }
}

pub fn get_trace<F: Field>(vm: VM) -> RowMajorMatrix<F> {
    let trace = vm.get_trace();

    println!("{:?}", trace);

    let mut final_trace: Vec<F> = Vec::with_capacity(trace.len() * 9);
    for i in trace.iter() {
        for j in i.iter() {
            final_trace.push(F::from_canonical_u32(j.as_canonical_u32()));
        }
    }

    let mut index_pow = 1;
    while (final_trace.len() / 9) > 2_usize.pow(index_pow) {
        index_pow += 1;
    }
    let imi_trace = [
        final_trace[final_trace.len() - 9],
        final_trace[final_trace.len() - 8],
        final_trace[final_trace.len() - 7],
        final_trace[final_trace.len() - 6],
    ];
    for _ in 0..(2_usize.pow(index_pow)) - (final_trace.len() / 9) {
        final_trace.push(imi_trace[0]);
        final_trace.push(imi_trace[1]);
        final_trace.push(imi_trace[2]);
        final_trace.push(imi_trace[3]);
        for _ in 0..5 {
            final_trace.push(F::ZERO);
        }
    }

    RowMajorMatrix::new(final_trace, 9)
}
