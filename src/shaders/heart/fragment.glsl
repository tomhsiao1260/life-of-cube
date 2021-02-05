#define PI 3.1415926535897932384626433832795

uniform float uTime;        // normalized progress time 
uniform float uStep;        // number of splits  
uniform sampler2D uTexture; // texture for particles

varying vec3 vColor;        // particles color

void main()
{
    // enable: 0 (invisible), 1 (visible)
    float enable = floor(mod(uTime, 2.0 * uStep) / uStep);
    // enable transition trick (linear rather than step transition)
    float crop = mix(3.0, 20.0, enable) * (1.0 - mod(uTime, uStep) / uStep);
    crop = clamp(crop, 0.0, 1.0);
    // enable: 0 -> 1 (slope 3.0), 1 -> 0 (slope 20.0) 
    enable = mix(1.0 - crop, crop, enable);

    gl_FragColor  = texture2D(uTexture, gl_PointCoord);
    gl_FragColor *= vec4(vColor, 1.0);
    gl_FragColor *= enable;
}