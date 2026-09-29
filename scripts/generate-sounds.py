"""Synthesize the app's UI sound cues (original, license-free) into assets/sounds.

44.1 kHz, 16-bit mono WAV. Run from the project root: python scripts/generate-sounds.py
"""
import math
import random
import struct
import wave

SR = 44100
random.seed(7)


def env(n, attack, decay_tau):
    a = max(1, int(attack * SR))
    return [min(1.0, i / a) * math.exp(-i / (decay_tau * SR)) for i in range(n)]


def tone(freq, dur, attack=0.004, tau=0.08, partials=((1, 1.0),)):
    n = int(dur * SR)
    e = env(n, attack, tau)
    return [
        sum(amp * math.sin(2 * math.pi * freq * mult * i / SR) for mult, amp in partials) * e[i]
        for i in range(n)
    ]


def silence(dur):
    return [0.0] * int(dur * SR)


def mix(*tracks):
    n = max(len(t) for t in tracks)
    return [sum(t[i] for t in tracks if i < len(t)) for i in range(n)]


def at(track, offset):
    return silence(offset) + track


def lowpass(x, cutoff):
    rc = 1 / (2 * math.pi * cutoff)
    a = (1 / SR) / (rc + 1 / SR)
    y, prev = [], 0.0
    for v in x:
        prev = prev + a * (v - prev)
        y.append(prev)
    return y


def write(name, samples, peak_db):
    peak = max(abs(s) for s in samples) or 1
    gain = (10 ** (peak_db / 20)) / peak
    fade = int(0.004 * SR)
    for i in range(fade):  # de-click the tail
        samples[-1 - i] *= i / fade
    with wave.open(f"assets/sounds/{name}.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            b"".join(struct.pack("<h", int(max(-1, min(1, s * gain)) * 32767)) for s in samples)
        )


BELL = ((1, 1.0), (2.0, 0.18), (3.01, 0.06))
BUZZ = ((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.08))

# Soft tap: damped low 'tock' with a hint of filtered noise.
noise = lowpass([random.uniform(-1, 1) * math.exp(-i / (0.004 * SR)) for i in range(int(0.03 * SR))], 2500)
write("tap", mix(tone(520, 0.05, 0.001, 0.012, ((1, 1.0), (2.01, 0.25))), [v * 0.35 for v in noise]), -16)

# Checkbox tick: brighter and shorter.
write("tick", tone(1400, 0.035, 0.001, 0.008, ((1, 1.0), (2.5, 0.2))), -18)

# Correct: a rising fifth (E5 -> B5), bell-like.
write("correct", mix(tone(659.25, 0.35, 0.005, 0.10, BELL), at(tone(987.77, 0.45, 0.005, 0.14, BELL), 0.09)), -13)


# Alarm: three descending monitor-style pulses with a warm, slightly buzzy timbre.
def pulse(f):
    hold = int(0.13 * SR)
    return [v * (1 if i < hold else math.exp(-(i - hold) / (0.02 * SR))) for i, v in enumerate(tone(f, 0.18, 0.012, 10.0, BUZZ))]


write("alarm", lowpass(mix(at(pulse(523.25), 0), at(pulse(440.0), 0.23), at(pulse(349.23), 0.46)), 3200), -12)

# Complete: gentle major arpeggio (C5 E5 G5 C6) with a long bell decay.
write("complete", mix(*[at(tone(f, 1.1, 0.006, 0.35, BELL), k * 0.085) for k, f in enumerate([523.25, 659.25, 783.99, 1046.5])]), -13)
