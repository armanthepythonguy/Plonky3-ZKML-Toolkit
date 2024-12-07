mod p3;
mod vm;

mod test {
    use std::{fs::File, io::BufReader};

    use p3_field::FieldAlgebra;
    use p3_mersenne_31::Mersenne31;

    use crate::{
        p3::VMAir,
        vm::{Instructions, VM},
    };

    #[test]
    fn test_end_to_end() {
        //Generating the trace for the required program
        let program = vec![
            Instructions::Push(Mersenne31::from_canonical_u32(10)),
            Instructions::Push(Mersenne31::from_canonical_u32(20)),
            Instructions::Add,
            Instructions::Push(Mersenne31::from_canonical_u32(40)),
            Instructions::Sub,
            Instructions::Push(Mersenne31::TWO),
            Instructions::Mul
        ];
        let mut vm = VM::new(program);
        if let Err(error) = vm.run() {
            println!("{}", error);
            return;
        }

        //Generating proofs for the program
        let vmair = VMAir {};
        vmair.generate_proof(vm, Mersenne31::from_canonical_u32(20));
    }

    #[test]
    fn check_dense_computation(){
        let mut program: Vec<Instructions> = Vec::new();

        let file = File::open("./assets/32x64-Mersenne31.json").unwrap();
        let reader = BufReader::new(file);
        let inputs: Vec<usize> = serde_json::from_reader(reader).unwrap();

        let weights = inputs[2..2+(inputs[0]*inputs[1])].to_vec();
        let weights_2d:Vec<Vec<Mersenne31>> = weights.chunks(inputs[0]).map(|chunk| chunk.iter().map(|&x| Mersenne31::from_canonical_usize(x)).collect()).collect();
        let biases = inputs[2 + (inputs[0] * inputs[1])..2 + (inputs[0] * inputs[1]) + inputs[0]].to_vec();
        let layer_input = inputs[2 + (inputs[0] * inputs[1]) + inputs[0]..2 + (inputs[0] * inputs[1]) + inputs[0] + inputs[1]].to_vec();

        for i in 0..inputs[0]{
            for j in 0..inputs[1]{
                program.push(Instructions::Push(weights_2d[j][i]));
                program.push(Instructions::Push(Mersenne31::from_canonical_usize(layer_input[j])));
                program.push(Instructions::Mul);
                program.push(Instructions::Add);
            }
            program.push(Instructions::Push(Mersenne31::from_canonical_usize(biases[i])));
            program.push(Instructions::Add);
        }

        let mut vm = VM::new(program);
        if let Err(error) = vm.run() {
            println!("{}", error);
            return;
        }

        //Generating proofs for the program
        let vmair = VMAir {};
        vmair.generate_proof(vm, Mersenne31::from_canonical_usize(inputs[inputs.len()-1]));

    }
}
