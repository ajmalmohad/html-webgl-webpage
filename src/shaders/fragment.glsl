//Uniforms
uniform sampler2D uTexture1;
uniform float uTime;

//Varyings
varying float vNoise;
varying vec2 vUv;
varying vec3 vNormal;

void main(){
    vec2 newUv = vUv;

    // vec4 oceanView = texture2D(uTexture1,newUv);

    gl_FragColor = vec4(vUv,0.,1.); 
}