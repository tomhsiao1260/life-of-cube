#define PI 3.1415926535897932384626433832795

uniform float uTime;
uniform float uLength;

varying vec2 vUv;
varying float strength;
varying float vCurrentMode;
varying float vRoundness;


void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float cycle = 1.0*PI;
    float maxMode = 16.0;
    float stepMode = 2.0;

    float currentMode = floor(mod(uTime/cycle, maxMode/stepMode))*stepMode;
    float amp = mix(0.06, 0.005, currentMode/maxMode);
    float k = 2.0*PI/cycle;
    float roundness = (1.0+sin(k*uTime-PI/2.0))/2.0;

    vec3 shift = abs(sin(modelPosition.xyz*PI/uLength*currentMode));
    vec3 norm = normalize(modelPosition.xyz)/sqrt(uLength)/4.0;
    norm *= (1.0+amp*shift.x) * (1.0+amp*shift.y) * (1.0+amp*shift.z);;
    
    modelPosition.xyz = mix(modelPosition.xyz, norm, roundness);
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    strength = shift.x+shift.y+shift.z+0.5;
    strength += 1.0-step(0.01, currentMode);
    strength = clamp(strength, 0.0, 1.0); 
    strength = mix(1.0, strength, pow(roundness, 3.0));

    vUv = uv;
    vCurrentMode = currentMode;
    vRoundness = roundness;
}