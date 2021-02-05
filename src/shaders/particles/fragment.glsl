#define PI 3.1415926535897932384626433832795

uniform float uTime;        // normalized progress time 
uniform float uStep;        // number of splits
uniform sampler2D uTexture; // texture for particles

varying float vMode;        // current mode
varying vec2 vUv;           // UV coordinate

void main()
{
    // roundness: 0 (cube) ~ 1 (cell)
    float roundness = (1.0 - cos(2.0 * PI * uTime)) / 2.0;

    // heartbeat (a high frequency signal with step function filter)
    float beat = (1.0 + cos(roundness * 27.0)) / 2.0;
    beat *= step(0.78, roundness) * 0.5;
    // no beat when mode below 2
    beat *= step(2.01, vMode);

    float transition = roundness / sqrt(vMode);

    vec3 originColor = vec3(vUv, 1.0) / 4.0;
    vec3 beatColor   = vec3(0.6, 0.0, 0.6);
    vec3 color       = originColor;

    // add heartbeat color when heartbeat occurs (beat ~ 1)
    color = mix( color, beatColor, beat );
    // transition between cube (originColor) and cells (color)
    color = mix( originColor, color, transition );

    // enable: 0 (invisible), 1 (visible)
    float enable = floor(mod(uTime, 2.0 * uStep) / uStep);
    // enable transition trick (linear rather than step transition)
    float crop = mix(3.0, 20.0, enable) * (1.0 - mod(uTime, uStep) / uStep);
    crop = clamp(crop, 0.0, 1.0);
    // enable: 0 -> 1 (slope 3.0), 1 -> 0 (slope 20.0) 
    enable = mix(1.0 - crop, crop, enable);

    gl_FragColor  = texture2D(uTexture, gl_PointCoord);
    gl_FragColor *= vec4(color, 1.0);
    gl_FragColor *= enable;
}