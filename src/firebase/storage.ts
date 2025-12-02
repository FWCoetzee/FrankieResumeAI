
'use client';

import { FirebaseStorage, ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from "firebase/storage";
import { User } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an avatar image for a user with progress tracking.
 * @param storage The Firebase Storage instance.
 * @param user The current user.
 * @param file The image file to upload.
 * @param onProgress A callback function to report upload progress (0-100).
 * @returns A Promise that resolves with the public URL of the uploaded image.
 */
export function uploadAvatar(
    storage: FirebaseStorage,
    user: User,
    file: File,
    onProgress: (percentage: number) => void
): Promise<string> {
    if (!user) {
        return Promise.reject(new Error("User must be logged in to upload an avatar."));
    }
    if (!file.type.startsWith("image/")) {
        return Promise.reject(new Error("File is not an image."));
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `avatars/${user.uid}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot: UploadTaskSnapshot) => {
                // Progress function
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                // Error function
                console.error("Avatar upload failed:", error);
                reject(new Error("Failed to upload avatar to Firebase Storage."));
            },
            () => {
                // Complete function
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch((error) => {
                    console.error("Failed to get download URL:", error);
                    reject(new Error("Upload complete, but failed to get download URL."));
                });
            }
        );
    });
}
