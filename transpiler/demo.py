import tensorflow as tf
import numpy as np
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense
import os

x = []
for i in range(1,300,3):
  x.append([i, i+1, i+2, i+3, i+4, i+5, i+6])
y = [i for i in range(7, 107)]
x = np.array(x)
y = np.array(y)
print(x)

model = Sequential()
model.add(Dense(64, input_shape=(7,)))
model.add(Dense(32))
model.add(Dense(16))
model.add(Dense(8))
model.add(Dense(4))
model.add(Dense(1, activation="relu"))
model.compile(optimizer='adam', loss='mse')
model.fit(x, y, epochs=100)

tf.saved_model.save(model, 'model')
os.system("python -m tf2onnx.convert --saved-model model --output model.onnx")