import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Upload } from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
    padding: '2rem'
  },
  card: {
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#1e293b',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    border: '1px solid #334155'
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#cbd5e1',
    marginBottom: '1.5rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  btnBlue: {
    background: '#2563eb',
    color: 'white'
  },
  btnAmber: {
    background: '#d97706',
    color: 'white'
  },
  btnSlate: {
    background: '#475569',
    color: 'white'
  },
  btnGreen: {
    background: '#16a34a',
    color: 'white',
    width: '100%',
    justifyContent: 'center',
    fontSize: '1.125rem',
    padding: '1rem'
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    background: '#475569',
    color: 'white',
    borderRadius: '0.5rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: 'fit-content',
    marginBottom: '1.5rem',
    transition: 'all 0.2s'
  },
  hiddenInput: {
    display: 'none'
  },
  canvasContainer: {
    background: '#0f172a',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1.5rem'
  },
  canvas: {
    width: '100%',
    cursor: 'crosshair'
  },
  legend: {
    marginTop: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#cbd5e1',
    fontSize: '0.875rem'
  },
  legendBox: {
    width: '1rem',
    height: '1rem',
    borderRadius: '0.25rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  band: {
    background: '#475569',
    borderRadius: '0.5rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  bandSelected: {
    background: '#475569',
    borderRadius: '0.5rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 0 0 2px #f59e0b'
  },
  bandTitle: {
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '500',
    marginBottom: '0.75rem'
  },
  inputGroup: {
    marginBottom: '0.75rem'
  },
  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.75rem',
    marginBottom: '0.25rem'
  },
  input: {
    width: '100%',
    background: '#1e293b',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    border: 'none',
    fontSize: '0.875rem'
  },
  rangeInput: {
    width: '100%',
    padding: 0
  },
  qValue: {
    fontSize: '0.75rem',
    color: '#cbd5e1'
  },
  scoreCard: {
    background: '#14532d',
    border: '1px solid #16a34a',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginTop: '1.5rem'
  },
  scoreTitle: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  scoreText: {
    color: '#86efac'
  },
  successText: {
    color: '#4ade80',
    fontSize: '0.875rem',
    marginTop: '0.5rem'
  }
};

const EQMatchingGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [selectedBand, setSelectedBand] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [bypassFilters, setBypassFilters] = useState(false);
  const canvasRef = useRef(null);

  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const filtersRef = useRef([]);
  const gainNodeRef = useRef(null);

  const [targetEQ, setTargetEQ] = useState([]);

  const [userEQ, setUserEQ] = useState([
    { freq: 120, gain: 0, q: 1.0 },
    { freq: 800, gain: 0, q: 1.0 },
    { freq: 3200, gain: 0, q: 1.0 }
  ]);

  useEffect(() => {
    const generateRandomEQ = () => {
      const freqRanges = [
        { min: 80, max: 250 },
        { min: 400, max: 2000 },
        { min: 2500, max: 8000 }
      ];

      return freqRanges.map(range => ({
        freq: Math.round(Math.random() * (range.max - range.min) + range.min),
        gain: Math.round((Math.random() * 24 - 12) * 2) / 2,
        q: Math.round((Math.random() * 2 + 0.5) * 10) / 10
      }));
    };

    setTargetEQ(generateRandomEQ());
  }, []);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    drawEQCurve();
  }, [userEQ, selectedBand, hasSubmitted, targetEQ]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    setAudioBuffer(decodedBuffer);

    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
    }
  };
  const createAudioSource = (useBypass) => {
    const shouldBypass = useBypass !== undefined ? useBypass : bypassFilters;

    if (!audioBuffer || targetEQ.length === 0) return null;

    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.loop = true;

    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.gain.value = 0.5;

    if (shouldBypass) {
      source.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
    } else {
      // Create filters only if they don't exist or if targetEQ changed
      if (filtersRef.current.length === 0 || filtersRef.current.length !== targetEQ.length) {
        filtersRef.current = targetEQ.map((band) => {
          const filter = ctx.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = band.freq;
          filter.Q.value = band.q;
          filter.gain.value = band.gain;
          return filter;
        });

        // Pre-connect the filter chain
        for (let i = 0; i < filtersRef.current.length - 1; i++) {
          filtersRef.current[i].connect(filtersRef.current[i + 1]);
        }
        filtersRef.current[filtersRef.current.length - 1].connect(gainNodeRef.current);
      }

      // Just connect source to first filter
      source.connect(filtersRef.current[0]);
    }

    gainNodeRef.current.connect(ctx.destination);
    source.start();
    return source;
  };

  const togglePlayback = () => {
    if (!audioBuffer) return;
    if (targetEQ.length === 0) {
      console.log('Target EQ not ready yet');
      return;
    }

    console.log('Creating audio source with target EQ:', targetEQ);

    if (!isPlaying) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      sourceRef.current = createAudioSource();
      setIsPlaying(true);
    } else {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const toggleBypass = () => {
    const newBypassState = !bypassFilters;
    setBypassFilters(newBypassState);

    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }

      setTimeout(() => {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        sourceRef.current = createAudioSource(newBypassState);
        if (!sourceRef.current) {
          setIsPlaying(false);
        }
      }, 50);
    }
  };

  const updateBand = (index, updates) => {
    setUserEQ(prev => {
      const newEQ = [...prev];
      newEQ[index] = { ...newEQ[index], ...updates };
      return newEQ;
    });
  };

  const freqToX = (freq, width) => {
    const minFreq = Math.log10(20);
    const maxFreq = Math.log10(20000);
    const logFreq = Math.log10(freq);
    return ((logFreq - minFreq) / (maxFreq - minFreq)) * width;
  };

  const xToFreq = (x, width) => {
    const minFreq = Math.log10(20);
    const maxFreq = Math.log10(20000);
    const logFreq = minFreq + (x / width) * (maxFreq - minFreq);
    return Math.pow(10, logFreq);
  };

  const gainToY = (gain, height) => {
    const minGain = -12;
    const maxGain = 12;
    return height - ((gain - minGain) / (maxGain - minGain)) * height;
  };

  const yToGain = (y, height) => {
    const minGain = -12;
    const maxGain = 12;
    return maxGain - (y / height) * (maxGain - minGain);
  };

  const calculateEQResponse = (freq, bands) => {
    let totalGainLinear = 1;

    bands.forEach(band => {
      const sampleRate = 48000;
      const w0 = 2 * Math.PI * band.freq / sampleRate;
      const A = Math.pow(10, band.gain / 40);
      const alpha = Math.sin(w0) / (2 * band.q);

      const b0 = 1 + alpha * A;
      const b1 = -2 * Math.cos(w0);
      const b2 = 1 - alpha * A;
      const a0 = 1 + alpha / A;
      const a1 = -2 * Math.cos(w0);
      const a2 = 1 - alpha / A;

      const nb0 = b0 / a0;
      const nb1 = b1 / a0;
      const nb2 = b2 / a0;
      const na1 = a1 / a0;
      const na2 = a2 / a0;

      const w = 2 * Math.PI * freq / sampleRate;

      const numReal = nb0 + nb1 * Math.cos(w) + nb2 * Math.cos(2 * w);
      const numImag = -nb1 * Math.sin(w) - nb2 * Math.sin(2 * w);

      const denReal = 1 + na1 * Math.cos(w) + na2 * Math.cos(2 * w);
      const denImag = -na1 * Math.sin(w) - na2 * Math.sin(2 * w);

      const denominator = denReal * denReal + denImag * denImag;
      const hReal = (numReal * denReal + numImag * denImag) / denominator;
      const hImag = (numImag * denReal - numReal * denImag) / denominator;

      const magnitude = Math.sqrt(hReal * hReal + hImag * hImag);
      totalGainLinear *= magnitude;
    });

    return 20 * Math.log10(totalGainLinear);
  };

  const drawEQCurve = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;

    for (let gain = -12; gain <= 12; gain += 3) {
      const y = gainToY(gain, height);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      if (gain === 0) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
      }
    }

    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    frequencies.forEach(freq => {
      const x = freqToX(freq, width);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    frequencies.forEach(freq => {
      const x = freqToX(freq, width);
      const label = freq >= 1000 ? (freq / 1000) + 'k' : freq.toString();
      ctx.fillText(label, x, height - 5);
    });

    ctx.textAlign = 'right';
    for (let gain = -12; gain <= 12; gain += 6) {
      const y = gainToY(gain, height);
      ctx.fillText((gain > 0 ? '+' : '') + gain + 'dB', width - 5, y - 5);
    }

    if (hasSubmitted && targetEQ.length > 0) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 2) {
        const freq = xToFreq(x, width);
        const gain = calculateEQResponse(freq, targetEQ);
        const y = gainToY(gain, height);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < width; x += 2) {
      const freq = xToFreq(x, width);
      const gain = calculateEQResponse(freq, userEQ);
      const y = gainToY(gain, height);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    userEQ.forEach((band, index) => {
      const x = freqToX(band.freq, width);
      const y = gainToY(band.gain, canvas.height);

      ctx.fillStyle = index === selectedBand ? '#f59e0b' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (!hasSubmitted) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), x, y + 4);
      }
    });
  };

  const handleCanvasMouseDown = (e) => {
    if (hasSubmitted) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (let i = 0; i < userEQ.length; i++) {
      const handleX = freqToX(userEQ[i].freq, canvas.width);
      const handleY = gainToY(userEQ[i].gain, canvas.height);
      const dist = Math.sqrt(Math.pow(x - handleX, 2) + Math.pow(y - handleY, 2));

      if (dist < 20) {
        setSelectedBand(i);
        setIsDragging(true);
        return;
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || hasSubmitted) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY));

    const freq = Math.round(xToFreq(x, canvas.width));
    const gain = Math.round(yToGain(y, canvas.height) * 2) / 2;

    updateBand(selectedBand, {
      freq: Math.max(20, Math.min(20000, freq)),
      gain: Math.max(-12, Math.min(12, gain))
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const calculateScore = () => {
    let totalError = 0;
    userEQ.forEach((band, i) => {
      const freqErrorRatio = Math.abs(Math.log10(band.freq) - Math.log10(targetEQ[i].freq)) / Math.log10(20000 / 20);
      const freqError = freqErrorRatio * 25;
      const gainError = Math.abs(band.gain - targetEQ[i].gain) * 4;
      const qError = Math.abs(band.q - targetEQ[i].q) * 3;

      totalError += freqError + gainError + qError;
    });

    const maxError = 200;
    const score = Math.max(0, Math.round((1 - totalError / maxError) * 100));
    return score;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setHasSubmitted(true);
  };

  const resetGame = () => {
    setUserEQ([
      { freq: 120, gain: 0, q: 1.0 },
      { freq: 800, gain: 0, q: 1.0 },
      { freq: 3200, gain: 0, q: 1.0 }
    ]);
    setHasSubmitted(false);
    setScore(null);
    setSelectedBand(0);

    const wasPlaying = isPlaying;
    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
    }

    // Clear existing filters so they'll be recreated
    filtersRef.current = [];

    const freqRanges = [
      { min: 80, max: 250 },
      { min: 400, max: 2000 },
      { min: 2500, max: 8000 }
    ];

    const newTargetEQ = freqRanges.map(range => ({
      freq: Math.round(Math.random() * (range.max - range.min) + range.min),
      gain: Math.round((Math.random() * 24 - 12) * 2) / 2,
      q: Math.round((Math.random() * 2 + 0.5) * 10) / 10
    }));

    setTargetEQ(newTargetEQ);

    if (wasPlaying && audioBuffer) {
      setTimeout(() => {
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        sourceRef.current = createAudioSource();
        if (sourceRef.current) {
          setIsPlaying(true);
        }
      }, 100);
    }
  };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Parametric EQ Matching Game</h1>
        <p style={styles.subtitle}>
          Upload audio, listen to the EQ'd version, drag points to match what you hear
        </p>

        <label style={styles.fileLabel}>
          <Upload size={20} />
          <span>{audioFile ? audioFile.name : 'Upload Audio File'}</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={styles.hiddenInput}
          />
        </label>
        {audioFile && (
          <p style={styles.successText}>✓ Ready</p>
        )}

        <div style={styles.controls}>
          <button
            onClick={togglePlayback}
            style={{ ...styles.button, ...styles.btnBlue }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={toggleBypass}
            style={{ ...styles.button, ...(bypassFilters ? styles.btnAmber : styles.btnSlate) }}
          >
            {bypassFilters ? 'Bypassed' : 'Bypass'}
          </button>
          <button
            onClick={resetGame}
            style={{ ...styles.button, ...styles.btnSlate }}
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        <div style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            width={900}
            height={400}
            style={styles.canvas}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendBox, background: '#2563eb' }}></div>
              <span>Your EQ</span>
            </div>
            {hasSubmitted && (
              <div style={styles.legendItem}>
                <div style={{ ...styles.legendBox, background: '#22c55e', opacity: 0.5 }}></div>
                <span>Target</span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.grid}>
          {userEQ.map((band, index) => (
            <div
              key={index}
              onClick={() => setSelectedBand(index)}
              style={selectedBand === index ? styles.bandSelected : styles.band}
            >
              <h3 style={styles.bandTitle}>Band {index + 1}</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Frequency (Hz)</label>
                <input
                  type="number"
                  value={Math.round(band.freq)}
                  onChange={(e) => updateBand(index, { freq: parseFloat(e.target.value) || 20 })}
                  disabled={hasSubmitted}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Gain (dB)</label>
                <input
                  type="number"
                  step="0.5"
                  value={band.gain}
                  onChange={(e) => updateBand(index, { gain: parseFloat(e.target.value) || 0 })}
                  disabled={hasSubmitted}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Q: {band.q.toFixed(1)}</label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={band.q}
                  onChange={(e) => updateBand(index, { q: parseFloat(e.target.value) })}
                  disabled={hasSubmitted}
                  style={styles.rangeInput}
                />
              </div>
            </div>
          ))}
        </div>

        {!hasSubmitted && (
          <button
            onClick={handleSubmit}
            style={{ ...styles.button, ...styles.btnGreen }}
          >
            <CheckCircle size={24} />
            Submit & Check Score
          </button>
        )}

        {hasSubmitted && (
          <div style={styles.scoreCard}>
            <h2 style={styles.scoreTitle}>Score: {score}/100</h2>
            <p style={styles.scoreText}>
              {score >= 90 ? 'Good job, no promotion!' :
                score >= 70 ? 'good' :
                  score >= 50 ? 'keep going...' :
                    'try again'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EQMatchingGame;