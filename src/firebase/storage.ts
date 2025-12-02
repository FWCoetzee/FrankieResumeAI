
'use client';

import { FirebaseStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an avatar image for a user.
 * @param storage The Firebase Storage instance.
 * @param user The current user.
 * @param file The image file to upload.
 * @returns The public URL of the uploaded image.
 */
export async function uploadAvatar(
    storage: FirebaseStorage,
    user: User,
    file: File
): Promise<string> {
    if (!user) {
        throw new Error("User must be logged in to upload an avatar.");
    }
    if (!file.type.startsWith("image/")) {
        throw new Error("File is not an image.");
    }

    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `avatars/${user.uid}/${fileName}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Avatar upload failed:", error);
        throw new Error("Failed to upload avatar to Firebase Storage.");
    }
}
