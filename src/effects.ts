const effects = [
  {
    name: "Transparent",
    type: 0,
    description: "Does not render anything - whatever was previously rendered will be shown",
    params: [
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ],
  },
  {
    name: "Off",
    type: 1,
    description: "Turns off all LEDs in the region",
    params: [
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Solid Color",
    type: 2,
    description: "Sets all LEDs in a region to the provided color",
    params: [
      {
        name: "color",
        description: "Background color",
        type: "color",
        required: true
      },
      {
        name: "layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Blink",
    type: 3,
    description: "Blinks the entire strip between two colors at a set duration",
    params: [
      {
        name: "first",
        description: "First blink color",
        type: "color",
        required: true,
      },
      {
        name: "second",
        description: "Second blink color",
        type: "color",
        required: true,
      },
      {
        name: "duration",
        description: "Time for each color (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Alternate",
    type: 4,
    description: "Repeats two pixel colors along a region. Colors swap at a set speed",
    params: [
      {
        name: "first",
        description: "First alternate color",
        type: "color",
        required: true,
      },
      {
        name: "second",
        description: "Second alternate color",
        type: "color",
        required: true,
      },
      {
        name: "duration",
        description: "Time for alternations (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Color Wipe",
    type: 5,
    description: "Progressively wipes the region from one color to the next over the duration",
    params: [
      {
        name: "first",
        description: "First wipe color",
        type: "color",
        required: true,
      },
      {
        name: "second",
        description: "Second wipe color",
        type: "color",
        required: true,
      },
      {
        name: "duration",
        description: "Time between wipes (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Breathe",
    type: 6,
    description: "iDevice style standby breathing animation (fixed speed)",
    params: [
      {
        name: "first",
        description: "First wipe color",
        type: "color",
        required: true,
      },
      {
        name: "second",
        description: "Second wipe color",
        type: "color",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Fade",
    type: 7,
    description: "Fade between two colors cyclically",
    params: [
      {
        name: "first",
        description: "Color to fade from",
        type: "color",
        required: true,
      },
      {
        name: "second",
        description: "Color to fade to",
        type: "color",
        required: true,
      },
      {
        name: "duration",
        description: "Fade duration (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Scan",
    type: 8,
    description: "Moves a single pixel back and forth across a lighting region",
    params: [
      {
        name: "background",
        description: "Background color",
        type: "color",
        required: true,
      },
      {
        name: "second",
        description: "Scan pixel color",
        type: "color",
        required: true,
      },
      {
        name: "duration",
        description: "Time for an entire scan (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Rainbow",
    type: 9,
    description: "Cycles the entire region through a rainbow spectrum of colors at a set speed",
    params: [
      {
        name: "speed",
        description: "Color change speed (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Rainbow Cycle",
    type: 10,
    description: "Sets the region to the rainbow spectrum and moves the colors along the region at a set speed",
    params: [
      {
        name: "speed",
        description: "Rainbow cycle speed (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Color Chase",
    type: 11,
    description: "Three color marquee chase lights",
    params: [
      {
        name: "first",
        description: "First chase color",
        type: "color",
        required: true,
      },
      {
        name: "second",
        description: "Second chase color",
        type: "color",
        required: true,
      },
      {
        name: "third",
        description: "Second chase color",
        type: "color",
        required: true,
      },
      {
        name: "speed",
        description: "Chase speed (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Theater Chase",
    type: 12,
    description: "Theater marquee style chase lights",
    params: [
      {
        name: "color",
        description: "Marquee color",
        type: "color",
        required: true,
      },
      {
        name: "speed",
        description: "Chase speed (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Twinkle",
    type: 13,
    description: "Randomly twinkles a second color on top of a background color",
    params: [
      {
        name: "background",
        description: "Background color",
        type: "color",
        required: true,
      },
      {
        name: "twinkle",
        description: "Twinkle color",
        type: "color",
        required: true,
      },
      {
        name: "speed",
        description: "Twinkle speed (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Sparkle",
    type: 14,
    description: "Randomly sparkles a color along the region on top of a background color",
    params: [
      {
        name: "background",
        description: "Background color",
        type: "color",
        required: true,
      },
      {
        name: "sparkle",
        description: "Sparkle color",
        type: "color",
        required: true,
      },
      {
        name: "speed",
        description: "Sparkle speed (ms)",
        type: "number",
        required: true,
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  },
  {
    name: "Reactive Fade - Attitude",
    type: 15,
    description: "Fades between colors based on changes in attitude along a single axis",
    params: [
      {
        name: "from",
        description: "Color to fade from",
        type: "color",
        required: true
      },
      {
        name: "to",
        description: "Color to fade to",
        type: "color",
        required: true
      },
      {
        name: "min",
        description: "Minimum attitude value",
        type: "number",
        required: true
      },
      {
        name: "max",
        description: "Maximum attitude value",
        type: "number",
        required: true
      },
      {
        name: "axis",
        description: "Attitude Axis",
        type: "attitudeAxis",
        required: true
      },
      {
        name: "layer",
        description: "Layer",
        type: "number",
        required: false
      }
    ]
  }
]

export default effects;