#define PI 3.1415926535897932384626433832795

uniform float uTime;

varying vec2 vUv;
varying float vStrength;
varying float vMode;

void main()
{
    // roundness: 0 (cube) ~ 1 (cell)
    float roundness = (1.0 - cos(2.0 * PI * uTime)) / 2.0;
    // center point of each cell in UV coordinate (two dimension in 0~1)
    vec2 center = (floor(vUv * vMode) + vec2(0.5)) / vMode;
    // 0 (near cell edge) ~ 1 (cell center)
    float brightness = distance(vUv, center) * 2.0 * vMode;
    brightness = 1.0 - brightness;

    // heartbeat (a high frequency signal with step function filter)
    float beat = (1.0 + cos(roundness * 27.0)) / 2.0;
    beat *= step(0.78, roundness);
    // only show beat color on the cell edge
    beat = clamp(beat - vStrength / 2.0, 0.0, 1.0);
    // no beat when mode below 2
    beat *= step(2.01, vMode);

    float transition = roundness / sqrt(vMode);

    vec3 originColor = vec3(vUv, 1.0) / 1.3;
    vec3 darkColor   = vec3(0.0);
    vec3 beatColor   = vec3(0.7, 0.0, 0.7);
    vec3 brightColor = vec3(0.8);
    vec3 color       = originColor;

    // add darkness near the cell edge
    color = mix(   darkColor,       color,  vStrength );
    // add heartbeat color when heartbeat occurs (beat ~ 1)
    color = mix(       color,   beatColor,       beat );
    // add brightness around cell center
    color = mix(       color, brightColor, brightness );
    // transition between cube (originColor) and cells (color)
    color = mix( originColor,       color, transition );

    gl_FragColor = vec4(color, 1.0);
}