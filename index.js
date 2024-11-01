import { Application } from '@splinetool/runtime';

// Select the canvas element where the Spline scene will render
const canvas = document.getElementById('canvas3d');
const spline = new Application(canvas);

const objectMap = {};

async function loadSplineScene() {
    try {
        await spline.load('https://prod.spline.design/AGJBVSU0MbgGzVmK/scene.splinecode');
        console.log('Spline scene loaded successfully');

        if (spline && spline._scene) {
            spline._scene.traverse((object) => {
                if (object.name === 'TestObject') {
                    console.log('Object found:', object);
                    objectMap[object.uuid] = object;
                }
            });

            spline.addEventListener('mouseDown', (e) => {
                if (e.target && objectMap[e.target.id]) {
                    console.log('Object clicked:', objectMap[e.target.id]);
                    changeObjectColor(objectMap[e.target.id]);
                }
            });
        } else {
            console.error('Scene not properly initialized or not available.');
        }
    } catch (error) {
        console.error('Error loading Spline scene:', error);
    }
}

function changeObjectColor(object) {
    console.log('Trying to change color for:', object);

    if (object.material) {
        console.log('Material found:', object.material);
        console.log('Material type:', object.material.type); 

        if (object.geometry && object.geometry.attributes.color) {
            const colors = object.geometry.attributes.color;
            for (let i = 0; i < colors.count; i++) {
              colors.setXYZ(i, 1, 0, 0);  // Set all vertices to red
            }
            colors.needsUpdate = true;
            spline.requestRender();  // Ensure scene rerender
        }
          

        // Check for properties or user data
        if (object.material.color) {
            object.material.color.set(0xff0000);
            console.log('Color changed to red for object:', object.name);
            object.material.needsUpdate = true;
            spline.requestRender();
        } else if (object.material.uniforms) {
            console.log('Inspecting material uniforms:', object.material.uniforms);
            let colorChanged = false;

            // Iterate over all the uniforms to search for a possible color-related value
            for (let uniformKey in object.material.uniforms) {
                const uniform = object.material.uniforms[uniformKey];
                
                if (uniformKey) {
                    if (uniform.value && (uniform.value.isColor || uniform.value.isVector3)) {
                        // Either set color (THREE.Color) or Vector3
                        if (uniform.value.isColor) {
                            if (uniform.value.getHex() === 0xff0000) {
                                uniform.value.set(0x0000FF);
                            } else {
                                uniform.value.set(0xff0000);
                            }
                        } else if (uniform.value.isVector3) {
                            uniform.value.set(colorChanged ? 0.5 : 1, 0, 0); // Toggle between gray and red
                        }

                        console.log(`Changed color for uniform ${uniformKey} to red.`);
                        uniform.needsUpdate = true;
                        object.material.needsUpdate = true; // Ensure the material knows it needs to be updated
                        colorChanged = true;
                    }
                }
            }

            if (colorChanged) {
                spline.requestRender(); // Request render after making the changes
            } else {
                console.error('No suitable color uniform found to update.');
            }
        } else {
            console.error('Material found, but no color property or suitable uniform found.');
        }
    } else {
        console.error('No material found on target object.');
    }
}

loadSplineScene();
