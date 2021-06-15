//Uniforms
uniform sampler2D uImage;
uniform float uTime;
uniform float uHoverState;

//Varyings
varying float vNoise;
varying float vDist;
varying vec2 vUv;
varying vec3 vNormal;

void main(){
    vec2 newUv=vUv;
    
    vec2 p=newUv;
    float x=uHoverState;
    x=0.1*smoothstep(0.,1.,(x*2.-p.y*1.));
    vec4 f=mix(
        texture2D(uImage,(p-0.5)*(1.-x)+.5),
        texture2D(uImage,(p-0.5)*x+.5),
        x
    );
    
    // vec4 TextureImage=texture2D(uImage,newUv);
    gl_FragColor=vec4(f);
    gl_FragColor.rgb += vec3(vNoise);
    // gl_FragColor = vec4(vDist,0.,0.,1.);
}
