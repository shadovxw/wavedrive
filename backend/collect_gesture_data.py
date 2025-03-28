import cv2
import numpy as np
import mediapipe as mp
import os

# Setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands()
labels_map = {'f': 0, 'l': 1, 'r': 2, 'b': 3, 's': 4}  # forward, left, right, backward, stop
X, y = [], []

# Webcam
cap = cv2.VideoCapture(0)
print("Press keys: f=forward, l=left, r=right, b=backward, s=stop, q=quit")

while True:
    ret, frame = cap.read()
    if not ret:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        landmarks = result.multi_hand_landmarks[0]
        points = []
        for lm in landmarks.landmark:
            points.extend([lm.x, lm.y, lm.z])  # 21 x 3 = 63

        # Draw landmarks
        mp.solutions.drawing_utils.draw_landmarks(frame, landmarks, mp_hands.HAND_CONNECTIONS)

        # Wait for key press to assign label
        cv2.putText(frame, "Press f/l/r/b/s to label, q to quit", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        cv2.imshow("Collect Gestures", frame)
        key = cv2.waitKey(1) & 0xFF

        if chr(key) in labels_map:
            X.append(points)
            y.append(labels_map[chr(key)])
            print(f"Saved frame as label {labels_map[chr(key)]}")
        elif chr(key) == 'q':
            break
    else:
        cv2.imshow("Collect Gestures", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Cleanup
cap.release()
cv2.destroyAllWindows()

# Save data
X = np.array(X)
y = np.array(y)
np.save("X_landmarks.npy", X)
np.save("y_labels.npy", y)
print(f"Saved {len(X)} samples to 'X_landmarks.npy' and 'y_labels.npy'")
