import cv2
import os

# Load your image
image_path = "tree.png"
img = cv2.imread(image_path)

if img is None:
    print("Error: Could not find tree.png in this folder!")
    exit()

# Setup variables
ref_point = []
cropping = False

def shape_selection(event, x, y, flags, param):
    global ref_point, cropping

    if event == cv2.EVENT_LBUTTONDOWN:
        ref_point = [(x, y)]
        cropping = True

    elif event == cv2.EVENT_LBUTTONUP:
        ref_point.append((x, y))
        cropping = False
        # Draw the final rectangle
        cv2.rectangle(img_copy, ref_point[0], ref_point[1], (0, 255, 0), 2)
        cv2.imshow("Visual Slicer", img_copy)

# Create output folder
if not os.path.exists("sprites"):
    os.makedirs("sprites")

img_copy = img.copy()
cv2.namedWindow("Visual Slicer")
cv2.setMouseCallback("Visual Slicer", shape_selection)

print("--- INSTRUCTIONS ---")
print("1. Drag mouse to select a tree.")
print("2. Press 's' to Save the selection.")
print("3. Press 'r' to Reset the view.")
print("4. Press 'q' to Quit.")

while True:
    cv2.imshow("Visual Slicer", img_copy)
    key = cv2.waitKey(1) & 0xFF

    if key == ord("r"):
        img_copy = img.copy()
        print("Selection reset.")

    elif key == ord("s"):
        if len(ref_point) == 2:
            # Calculate coordinates
            x1, y1 = ref_point[0]
            x2, y2 = ref_point[1]
            
            # Ensure coordinates are in correct order for slicing
            start_x, end_x = min(x1, x2), max(x1, x2)
            start_y, end_y = min(y1, y2), max(y1, y2)
            
            crop_img = img[start_y:end_y, start_x:end_x]
            
            filename = input("Enter name for this sprite (e.g., pine_tree): ")
            cv2.imwrite(f"sprites/{filename}.png", crop_img)
            print(f"Saved to sprites/{filename}.png")
            
            # Keep showing the image but clear the box for the next selection
            img_copy = img.copy()

    elif key == ord("q"):
        break

cv2.destroyAllWindows()