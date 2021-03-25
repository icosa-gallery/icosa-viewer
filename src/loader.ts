// Copyright 2021 Icosa Gallery
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import CameraControls from "camera-controls";
import { Material, Mesh, MeshStandardMaterial, RawShaderMaterial, Scene, Object3D, BufferAttribute } from "three";
import { TiltLoader } from "three/examples/jsm/loaders/TiltLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Convert, JSONPoly } from "./JSONSchema";
import { TiltBrushShaders } from "./tiltbrush/tiltbrushshaders"; 

export class Loader {
    private scene : Scene;
    //private tiltLoader : TiltLoader;
    private gltfLoader : GLTFLoader;

    constructor (scene : Scene, camercontrols : CameraControls) {
        //this.tiltLoader = new TiltLoader();
        this.gltfLoader = new GLTFLoader();
        this.scene = scene;
        new RawShaderMaterial()
    }

    public load(assetID : string) {
        this.gltfLoader.load(assetID, (gltf) => {
            var model = gltf.scene;
            model.traverse((object : Object3D) => {
                if(object.type === "Mesh") {
                    var mesh = object as Mesh;
                    var t = (mesh.material) as Material;
                    switch(t.name) {
                        case "brush_Light":
                            console.log(Object.keys(mesh.geometry.attributes));
                            mesh.geometry.name = "geometry_Light";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("normal"));
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Light"]);
                            mesh.material.name = "material_Light";
                            mesh.material.alphaTest = 0.9;
                            break;
                        case "brush_Smoke":
                            console.log(Object.keys(mesh.geometry.attributes));
                            mesh.geometry.name = "geometry_Smoke";

                            mesh.geometry.setAttribute("a_position", mesh.geometry.getAttribute("position"));
                            mesh.geometry.setAttribute("a_normal", mesh.geometry.getAttribute("position")); //in theory this should be "_tb_unity_normal" but I can't see anything with that.
                            mesh.geometry.setAttribute("a_color", mesh.geometry.getAttribute("color"));
                            mesh.geometry.setAttribute("a_texcoord0", mesh.geometry.getAttribute("_tb_unity_texcoord_0"));
                            mesh.geometry.setAttribute("a_texcoord1", mesh.geometry.getAttribute("_tb_unity_texcoord_1"));
                            mesh.material = new RawShaderMaterial(TiltBrushShaders["Smoke"]);
                            mesh.material.name = "material_Smoke";
                            break;
                        default:
                            mesh.material = new MeshStandardMaterial( { visible: false });
                    }
                }
            });
            this.scene.add(gltf.scene);
        });
    }

    public loadPoly(assetID : string) {
        const http = new XMLHttpRequest();
        const url = `https://api.icosa.gallery/poly/assets/${assetID}`;

        const that = this;
        http.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const polyAsset = Convert.toPoly(this.response);
                polyAsset.formats.forEach(format => {
                    if(format.formatType === "TILT") {
                        that.initTilt(format.root.url);
                        return;
                    }
                })
            }
        }

        http.open("GET", url, true);
        http.send();
    }

    public loadPolyURL(url : string) {
        var splitURL = url.split('/');
        if(splitURL[2] === "poly.google.com")
            this.loadPoly(splitURL[4]);
    }

    private initTilt(url : string) {
        this.scene.clear();
        // this.tiltLoader.load(url, (tilt) => {
        //     this.scene.add(tilt);
        // });
    }
}