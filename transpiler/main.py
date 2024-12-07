import tf2onnx
from onnx2json import convert
import onnx
from onnx import numpy_helper
import numpy as np

field = (2**31) -  1
layer_sum = {}
layer_res={}
onnx_model = onnx.load("model.onnx")

layers = {i.name.split("/")[2]: [] for i in onnx_model.graph.node}
for i in onnx_model.graph.node:
  if(len(i.input)==2):
    layers[i.name.split("/")[2]].append(i.input[1])

INTIALIZERS  = onnx_model.graph.initializer
onnx_weights = {}
for initializer in INTIALIZERS:
    W = numpy_helper.to_array(initializer)
    onnx_weights[initializer.name] = W

def get_field_elements(f):
  f*=100000
  return(int(str(f).split(".")[0])%field)

def check_layers(layers, name, res):
  if(layers[name.split("/")[2]][-1] == name):
    sum = 0
    for i in res:
      sum += i
    layer_sum[name.split("/")[2]] = sum%field
    layer_res[name.split("/")[2]] = res


def get_inference(inp):
   res = []
   for j in range(len(onnx_model.graph.node)):
    i = onnx_model.graph.node[j]
    props = i.input
    if(props[0] == "inputs"):
        res = []
        for x in range(onnx_weights[props[1]].shape[1]):
            mid = [inp[k]*onnx_weights[props[1]][k][x] for k in range(len(inp))]
            res.append(sum(mid))
        print(j, res, "\n")
        continue
    if(i.op_type == "MatMul"):
        mid1 = []
        for x in range(onnx_weights[props[1]].shape[1]):
            mid = [res[k]*onnx_weights[props[1]][k][x] for k in range(len(res))]
            mid1.append(sum(mid))
        res = mid1
    elif(i.op_type == "Add"):
        res = [res + onnx_weights[props[1]]][0]
    elif(i.op_type == "Relu"):
        res = np.array([k if k>0 else 0 for k in res])
    print(j, res, "\n")
    return res
   
def get_proved_inference(inpp):
   layer_res = {}
   layer_sum = {}
   result = get_inference(inpp)
   inp = [get_field_elements(i) for i in inpp]
   for j in range(len(onnx_model.graph.node)):
    i = onnx_model.graph.node[j]
    props = i.input
    if(props[0] == "inputs"):
        res = []
        for x in range(onnx_weights[props[1]].shape[1]):
            mid = [inp[k]*get_field_elements(onnx_weights[props[1]][k][x]) for k in range(len(inp))]
            mid = [i%field for i in mid]
            res.append(sum(mid))
        res  = [i%field for i in res]
        print(j, res, "\n")
        continue
    if(i.op_type == "MatMul"):
        mid1 = []
        for x in range(onnx_weights[props[1]].shape[1]):
            mid = [res[k]*get_field_elements(onnx_weights[props[1]][k][x]) for k in range(len(res))]
            mid1.append(sum(mid))
        mid1 = [i%field for i in mid1]
        res = mid1
        check_layers(layers, i.input[1], res)
    elif(i.op_type == "Add"):
        mid = [get_field_elements(i) for i in onnx_weights[props[1]]]
        res = [res[i]+mid[i] for i in range(len(res))]
        res = [i%field for i in res]
        check_layers(layers, i.input[1], res)
    elif(i.op_type == "Relu"):
        res = np.array([k if k>0 else 0 for k in res])
    print(j, res, "\n")
    inp_flag = ""
    out_files = {}
    for i in layers:
        layer = layers[i]
        out = [onnx_weights[layer[0]].shape[1], onnx_weights[layer[0]].shape[0]]
        for x in layer:
            try:
                for j in range(onnx_weights[x].shape[0]):
                    for k in onnx_weights[x][j]:
                        out.append(get_field_elements(k))
            except:
                for k in onnx_weights[x]:
                    out.append(get_field_elements(k))
        if(inp_flag == ""):
            out.extend(inp)
        else:
            out.extend(layer_res[inp_flag])
        inp_flag = i
        out.append(layer_sum[i])
        out_files[i] = out
   return(result, out_files)