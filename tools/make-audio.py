"""Synthesise calm tutorial music + UI sound effects (no external assets). Usage: python3 tools/make-audio.py <seconds>"""
import sys, numpy as np, subprocess, wave
SR=44100; dur=float(sys.argv[1]) if len(sys.argv)>1 else 220
rng=np.random.default_rng(7)
def env(n,a,r):
    e=np.ones(n); na=int(a*SR); nr=int(r*SR); e[:na]=np.linspace(0,1,na); e[-nr:]=np.linspace(1,0,nr); return e
def tone(f,d,kind='sine'):
    t=np.arange(int(d*SR))/SR
    if kind=='tri': return 2/np.pi*np.arcsin(np.sin(2*np.pi*f*t))
    return np.sin(2*np.pi*f*t)
def lp(x,k):  # simple one-pole lowpass
    y=np.zeros_like(x); a=k
    for i in range(1,len(x)): y[i]=y[i-1]+a*(x[i]-y[i-1])
    return y
def save(name,x,vol=0.9):
    x=x/ (np.abs(x).max()+1e-9)*vol
    with wave.open(f'/tmp/{name}.wav','w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg','-v','error','-y','-i',f'/tmp/{name}.wav','-b:a','160k',f'public/audio/{name}.mp3'],check=True)
# ---- SFX
n=int(0.06*SR); click=(rng.standard_normal(n)*np.exp(-np.linspace(0,9,n))); click=lp(click,0.5)+0.6*tone(1800,0.06)*np.exp(-np.linspace(0,10,n)); save('click',click)
d=1.2; t=np.arange(int(d*SR))/SR
imp=np.sin(2*np.pi*(95*np.exp(-t*2.2)+38)*t)*np.exp(-t*3.2)+0.25*lp(rng.standard_normal(len(t)),0.08)*np.exp(-t*5); save('impact',imp)
d=0.9; t=np.arange(int(d*SR))/SR; w=lp(rng.standard_normal(len(t)),0.12)*np.sin(np.pi*t/d)**2; save('whoosh',w,0.7)
d=0.35; pop=(tone(520,d)*np.exp(-np.linspace(0,7,int(d*SR)))+0.5*tone(780,d)*np.exp(-np.linspace(0,9,int(d*SR)))); save('pop',pop,0.8)
d=0.8; ch=(tone(988,d)+0.6*tone(1319,d)+0.4*tone(1760,d))*np.exp(-np.linspace(0,5,int(d*SR))); save('chime',ch,0.7)
# ---- Music: Cmaj7 - Am7 - Fmaj7 - G6, 72 bpm, soft pad + sparse plucks
bpm=72; beat=60/bpm; bar=4*beat
chords=[[261.6,329.6,392.0,493.9],[220.0,261.6,329.6,392.0],[174.6,220.0,261.6,329.6],[196.0,246.9,293.7,329.6]]
total=int(dur*SR); m=np.zeros(total)
nb=int(dur/bar)+1
for b in range(nb):
    ch=chords[b%4]; s=int(b*bar*SR); L=int((bar+0.6)*SR)
    pad=sum(tone(f/2,bar+0.6,'tri')*0.5+tone(f,bar+0.6)*0.35 for f in ch)
    pad=pad*env(len(pad),1.2,1.4)*0.5
    seg=min(L,total-s)
    if seg>0: m[s:s+seg]+=pad[:seg]
    for k,f in enumerate([ch[0]*2,ch[2]*2,ch[3]*2,ch[1]*4,ch[3]*2,ch[2]*2,ch[1]*2,ch[2]*2]):
        if (k+b)%3==2: continue
        ps=s+int(k*beat/2*SR); pl=tone(f,1.4)*np.exp(-np.linspace(0,5,int(1.4*SR)))*0.18
        seg=min(len(pl),total-ps)
        if seg>0: m[ps:ps+seg]+=pl[:seg]
dl=int(0.37*SR); m2=m.copy(); m2[dl:]+=0.35*m[:-dl]; m2[2*dl:]+=0.2*m[:-2*dl]
m2=lp(m2,0.18); m2*=np.minimum(1,np.minimum(np.arange(total)/(3*SR),(total-np.arange(total))/(4*SR)))
save('music',m2,0.8)
print('ok')
