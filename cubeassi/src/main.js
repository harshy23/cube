import './style.css'
import * as Three from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new Three.Scene();//this is conatiner which contain all other elelment like camera light etc.

const camera = new Three.PerspectiveCamera(75 , window.innerWidth / window.innerHeight , 0.1,1000)//(field of view in degree , aspect ratio, view fructrum(howm much object is visible))

const renderer =new Three.WebGLRenderer({
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth , window.innerHeight);
document.querySelector('#box_area').appendChild(renderer.domElement)

camera.position.z = 10;

renderer.render(scene , camera)

// creating cube
const geometry = new Three.BoxGeometry( 3, 3, 3 ); 
const material = new Three.MeshMatcapMaterial( {color: 0x00ff00 } ); 
const cube = new Three.Mesh( geometry, material ); 
scene.add( cube );


// adding lights for reflection
const light = new Three.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);

const ambientLight = new Three.AmbientLight(0x404040); // soft light

const lighthelper = new Three.PointLightHelper(light)
const lighthe = new Three.DirectionalLightHelper(light);
scene.add(lighthelper,light,ambientLight,lighthe);


const control = new OrbitControls(camera,renderer.domElement);

//speed control
let rotationx = 0;
let rotationy =0;
document.querySelector("#rotaion").addEventListener("input" , (e)=>{
  const value = parseFloat(e.target.value);
  rotationx = value;
  rotationy =value;
});

//reset speed 
document.querySelector("#reset").addEventListener("click",()=>{
  rotationx =0;
  rotationy=0;
  // cube.position.x = 0;
  cube.position.set(0,0,0);
  cube.rotation.set(0, 0, 0);

  document.querySelector("#rotaion").value = "0";
});

// fixing cube movement boundries
const Bound = 5

function movecube(dx , dy){
  const newx = cube.position.x +dx;
  const newy = cube.position.y+dy;
  if(Math.abs(newx) <= Bound) cube.position.x = newx;
  if(Math.abs(newy)<= Bound) cube.position.y = newy;

}

document.querySelector("#left").addEventListener("click",()=>movecube(-1,0))
document.querySelector("#right").addEventListener("click",()=>movecube(1,0))
document.querySelector("#up").addEventListener("click",()=>movecube(0,1))
document.querySelector("#down").addEventListener("click",()=>movecube(0,-1))

// to fetch current properties of backend
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("http://localhost:5000/api/cubes/cube_1");
    const data = await res.json();

    // Only apply if cube data exists
    if (data && data.position) {
      cube.position.set(data.position.x, data.position.y, data.position.z);
      rotationx = data.rotationSpeed || 0;
      rotationy = data.rotationSpeed || 0;

      // Update slider value
      document.querySelector("#rotaion").value = rotationx;
    }
  } catch (err) {
    console.error("Failed to load cube state:", err);
    document.querySelector("#message").textContent = res.message || "saved";
  }
});
// to save properties

document.querySelector("#save").addEventListener("click", async () => {
  const body = {
    x: cube.position.x,
    y: cube.position.y,
    z: cube.position.z,
    rotationSpeed: rotationx
  };

  try {
    const res = await fetch("http://localhost:5000/api/cubes/cube_1/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    console.log(result.message || "Saved successfully");
  } catch (err) {
    console.error("Save failed:", err);
  }
});

// to reset cube
document.querySelector("#reset").addEventListener("click", async () => {
  rotationx = 0;
  rotationy = 0;
  cube.position.set(0, 0, 0);
  cube.rotation.set(0, 0, 0);
  document.querySelector("#rotaion").value = "0";

  try {
    const res = await fetch("http://localhost:5000/api/cubes/cube_1/reset", {
      method: "POST"
    });

    const result = await res.json();
    console.log(result.message || "Reset successful");
  } catch (err) {
    console.error("Reset failed:", err);
  }
});






// creating loop to call renderer inloop
function animate(){
  requestAnimationFrame(animate);
  cube.rotation.x += rotationx;
  cube.rotation.y += rotationy;
  control.update();//make sure changes are upadted in ui

  renderer.render(scene,camera);
}

animate()