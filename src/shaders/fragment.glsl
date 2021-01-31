#define PI 3.1415926535897932384626433832795

uniform float uTime;

varying vec2 vUv;
varying float strength;
varying float vCurrentMode;
varying float vRoundness;

void main()
{
    float mode = vCurrentMode + 1.0-step(0.01, vCurrentMode);
    vec2 center = (floor(vUv * mode) + vec2(0.5))/mode;
    float d = distance(vUv, center);
    float beat = step(0.78, vRoundness) * (1.0+cos(vRoundness*27.0))/2.0;
    beat = clamp(strength-beat+2.3/mode,0.0,1.0);

    vec3 color = vec3(vUv,1.0)/1.1;
    color = mix(vec3(0.7,0.0,0.7), color, beat);
    color = mix(vec3(0.0,0.0,0.0), color, strength);
    color = mix(vec3(0.8), color, d*mode*2.0);
    color = mix(vec3(vUv, 1.0)/1.1, color, vRoundness/sqrt(mode));

    gl_FragColor = vec4(color, 1.0);
}