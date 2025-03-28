import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

# Example: Load your landmark data and labels
# X should be of shape (num_samples, 63) for 21 landmarks * 3 (x, y, z)
# y should be integer labels for gestures: 0=forward, 1=left, etc.

# Replace this with your actual dataset loading logic
X = np.load('backend/X_landmarks.npy')  # shape: (samples, 63)
y = np.load('backend/y_labels.npy')     # shape: (samples,)

# Normalize X if needed
X = X.astype(np.float32)

# Convert labels to categorical
num_classes = len(np.unique(y))
y_cat = to_categorical(y, num_classes)

# Split into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y_cat, test_size=0.2, random_state=42)

# Build the model
model = Sequential([
    Dense(128, activation='relu', input_shape=(63,)),
    BatchNormalization(),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dropout(0.3),
    Dense(num_classes, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

# Train the model
model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=30, batch_size=32)

# Save the model
model.save('gesture_model.h5')
print("Model trained and saved as gesture_model.h5")
