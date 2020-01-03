# https://machinelearningmastery.com/tutorial-first-neural-network-python-keras/
# https://www.tensorflow.org/tensorboard/get_started

from numpy import loadtxt
from numpy import array
import numpy
import os
import tensorflow as tf
from pathlib import Path

l1 = loadtxt('processed/engnet.txt', delimiter=',')
l2 = loadtxt('processed/cmn2006.txt', delimiter=',')
l2 = array(l2)

def getChkDir(i):
  chkdir = "processed/chk"+str(i)
  Path(chkdir).mkdir(parents=True, exist_ok=True)
  return chkdir

def getCheckpointPath(i):
  return getChkDir(i) + "/cp.ckpt"

def createModel(i):    
  model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(94, activation='relu'),
    tf.keras.layers.Dense(94, activation='relu'),
    tf.keras.layers.Dense(94, activation='relu'),
    tf.keras.layers.Dense(2082, activation='softmax'),
  ])
  model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
  chkdir = getChkDir(i)
  checkpoint_path = getCheckpointPath(i)
  if os.path.isfile(chkdir+"/checkpoint"):
    print ("File exist")
    model.load_weights(checkpoint_path)
  else:
    print ("File not exist")
  return model

def doModel(i, epochcnt=500):  
  model = createModel(i)
  chkdir = getChkDir(i)  
  checkpoint_path = getCheckpointPath(i)
  checkpoint_dir = os.path.dirname(checkpoint_path)
  # Create a callback that saves the model's weights
  cp_callback = tf.keras.callbacks.ModelCheckpoint(filepath=checkpoint_path, 
    save_weights_only=True, 
    period=10,
    #save_freq = 500,
    verbose=1)
  #model.load_weights(checkpoint_path)
  #tf.keras.backend.set_floatx('float64')
  model.fit(x=l1, y=l2[:,i:i+1], callbacks=[cp_callback],epochs=epochcnt)
  #model.save("processed/models/"+str(i))
  return model

models = []
for i in range(0,100) :
   models.append(doModel(i, 11))


#for i in range(0,10) :
#   models.append(createModel(i))

#model.evaluate(x_test,  y_test, verbose=2)


#testing




inputStr = "God said Let there be light And there was light"

import json

file_object = open("processed/cmn2006_engnet_dict.json", 'r', encoding='utf8')
# Load JSON file data to a python dict object.
dict_object = json.load(file_object)

def wordToSeq(inputWord):
  inputWord = inputWord.lower()
  keys = dict_object['colInfo']['engnet']['keys']
  if inputWord in keys:
    return keys[inputWord]
  return {"id": ' ', "name": inputWord}

inputWords = inputStr.split()
a = map(wordToSeq, inputWords)
a = list(a)
for c in a:
  print(c)
  if c['id'] == ' ':
    print("Bad word " + c.name)

a = list(map(lambda x: x["id"], a))

#a= [5,6,7,8,9,6,10,11,6,12]
a.extend([0]*(94-len(a)))

import codecs

file = codecs.open("temp.txt", "w", "utf-8")
for i in range(0,10):
  co = numpy.array(models[i].predict([a])[0])  
  ind = (numpy.where(co==max(co))[0][0])
  chn = dict_object['colInfo']['cmn2006']['keyAry'][ind+1]
  print(chn)
  file.write(chn)

file.close()