import { Injectable } from "@angular/core";
import {
  Plugins,
  CameraResultType,
  Capacitor,
  FilesystemDirectory,
  CameraPhoto,
  CameraSource,
} from "@capacitor/core";
import { Platform } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
const baseUrl = `${environment.apiUrl}/storage`;

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: "root",
})
export class PhotoService {
  public photos: Photo[] = [];
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(platform: Platform, private http: HttpClient) {
    this.platform = platform;
  }

  public async loadSaved(objectId: string) {
    // Retrieve cached photo array data
    const photoList = await Storage.get({
      key: this.PHOTO_STORAGE + `${objectId}`,
    });
    this.photos = JSON.parse(photoList.value) || [];
    // If running on the web...
    if (!this.platform.is("hybrid")) {
      // Display the photo by reading into base64 format
      for (let photo of this.photos) {
        // Read each saved photo's data from the Filesystem
        //console.log(photo.filepath,"THIS??")
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data,
        });
        // Web platform only: Load the photo as base64 data
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }
  }

  /* Use the device camera to take a photo:
  // https://capacitor.ionicframework.com/docs/apis/camera

  // Store the photo data into permanent file storage:
  // https://capacitor.ionicframework.com/docs/apis/filesystem

  // Store a reference to all photo filepaths using Storage API:
  // https://capacitor.ionicframework.com/docs/apis/storage
  */
  public async addNewToGallery(objectId: string, type: string) {
    // Take a photo
    const capturedPhoto: any = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100, // highest quality (0 to 100)
    });
    const savedImageFile: any = await this.savePicture(
      capturedPhoto,
      objectId,
      type
    );
    // Add new photo to Photos array
    this.photos.unshift(savedImageFile);
    // Cache all photo data for future retrieval
    Storage.set({
      key: this.PHOTO_STORAGE + `${objectId}`,
      value: JSON.stringify(this.photos),
    });
  }

  // Save picture to file on device
  private async savePicture(
    cameraPhoto: CameraPhoto,
    objectId: string,
    type: string
  ) {
    // Convert photo to base64 format, required by Filesystem API to save
    const fileName = `${type}-${objectId}-` + new Date().getTime() + ".jpeg";
    const base64Data = await this.readAsBase64(cameraPhoto, fileName);
    // Write the file to the data directory
    // Might change this later idk for performance

    //console.log(fileName,"file name to be saved")
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data,
    });
    if (this.platform.is("hybrid")) {
      // Display the new image by rewriting the 'file://' path to HTTP
      // Details: https://ionicframework.com/docs/building/webview#file-protocol
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      // Use webPath to display the new image instead of base64 since it's
      // already loaded into memory
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath,
      };
    }
  }
  // Read camera photo into base64 format based on the platform the app is running on
  private async readAsBase64(cameraPhoto: CameraPhoto, fileName: string) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is("hybrid")) {
      // Read the file into base64 format
      //console.log(cameraPhoto.path,"huh??")
      const file = await Filesystem.readFile({
        path: cameraPhoto.path,
      });
      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response: any = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();
      const result = (await this.convertBlobToBase64(blob)) as string;

      this.uploadImageToServer(blob, fileName);

      return result;
    }
  }

  async uploadImageToServer(blob: any, fileName: string) {
    let imageData: FormData = new FormData();
    imageData.append("image", blob, fileName);
    this.http.post<any>(`${baseUrl}/upload`, imageData).subscribe();
  }
  // Delete picture by removing it from reference data and the filesystem** Localy
  public async deletePicture(photo: Photo, position: number, objectId: string) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);
    // Update photos array cache by overwriting the existing photo array
    Storage.set({
      key: this.PHOTO_STORAGE + `${objectId}`,
      value: JSON.stringify(this.photos),
    });

    // delete photo file from filesystem
    const filename = photo.filepath; //.substr(photo.filepath.lastIndexOf('/') + 1);
    //console.log(filename,"File name....")
    await this.deletePictureFromServer(photo.filepath);
    await Filesystem.deleteFile({
      path: filename,
      directory: FilesystemDirectory.Data,
    });
  }

  async deletePictureFromServer(fileName: string) {
    this.http.delete<any>(`${baseUrl}/files/${fileName}`).subscribe();
  }

  // cant async already contains a promise
  convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}

export interface Photo {
  filepath: string;
  webviewPath: string;
}
