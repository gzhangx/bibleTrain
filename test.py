#pip install tensorflow-gpu
from numpy import loadtxt
import tensorflow as tf
import numpy as np

def createModel() :
  model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(4, activation='relu'),
    tf.keras.layers.Dense(4, activation='relu'),
    tf.keras.layers.Dense(4, activation='relu'),
    tf.keras.layers.Dense(8, activation='softmax'),
  ])
  model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
  return model

data = np.array([
    [1,2,0,3],
    [2,2,3,1],
    [2,1,3,1],
    [2,1,3,0]
    ])

def fitOne():
  model = createModel()
  model.fit(x= data,
    y= data[:,0:1]*2,
        epochs=3000)
  return model

def getPrd1(data):
  res = (model.predict([data])[0]*10).astype(int)
  print(res,max(res))
  print(np.where(res==res.max())[0][0])

getPrd1([1,2,3,4])

models = [0]*4
for i in range(0,4):
  model = createModel()
  model.fit(x= data,
    y= data[:,i:i+1]*2,
        epochs=3000)
  models[i] = model

def getPrd(who, data):
  res = (models[who].predict([data])[0]*10).astype(int)
  print(res,max(res))
  print(np.where(res==res.max())[0][0])


testData = [1,2,3,4]
getPrd(0, testData)
getPrd(1, testData)
getPrd(2, testData)
getPrd(3, testData)