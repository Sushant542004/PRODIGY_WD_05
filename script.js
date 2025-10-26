/* Modernized WeatherApp (keeps your features, uses mock data by default)
   - Auto day/night theme
   - Voice search (if available)
   - Forecast scroll + drag
   - Unit toggle (C/F)
   - Particles (rain/snow)
   - keyboard shortcuts
   Replace mock calls with real API easily where noted.
*/

class WeatherApp {
  constructor() {
    this.apiKey = "YOUR_API_KEY_HERE"; // <-- replace when using real OWM
    this.currentLocationData = null;
    this.unit = "C"; // default
    this.lastQuery = null;
    this.themeMode = "auto"; // auto / light / dark
    this.init();
  }

  init() {
    this.cache();
    this.bind();
    this.updateDateTime();
    this.applyAutoTheme();
    this.getCurrentLocation(); // attempt on load
    this.initPeriodic();
    // Initialize forecast scroll & voice later to ensure DOM ready
    setTimeout(() => {
      this.initializeForecastScroll();
      this.initializeVoiceSearch();
    }, 500);
  }

  cache() {
    this.el = {
      searchBtn: document.getElementById("searchBtn"),
      locationBtn: document.getElementById("locationBtn"),
      locationInput: document.getElementById("locationInput"),
      retryBtn: document.getElementById("retryBtn"),
      loading: document.getElementById("loading"),
      weatherCard: document.getElementById("weatherCard"),
      errorMessage: document.getElementById("errorMessage"),
      errorText: document.getElementById("errorText"),
      cityName: document.getElementById("cityName"),
      country: document.getElementById("country"),
      dateTime: document.getElementById("dateTime"),
      temperature: document.getElementById("temperature"),
      feelsLike: document.getElementById("feelsLike"),
      weatherDescription: document.getElementById("weatherDescription"),
      weatherIcon: document.getElementById("weatherIcon"),
      visibility: document.getElementById("visibility"),
      humidity: document.getElementById("humidity"),
      windSpeed: document.getElementById("windSpeed"),
      pressure: document.getElementById("pressure"),
      uvIndex: document.getElementById("uvIndex"),
      cloudCover: document.getElementById("cloudCover"),
      forecastContainer: document.getElementById("forecastContainer"),
      tempUnitBtns: document.querySelectorAll(".temp-unit"),
      themeToggle: document.getElementById("themeToggle"),
    };
  }

  bind() {
    this.el.searchBtn.addEventListener("click", () => this.searchWeather());
    this.el.locationBtn.addEventListener("click", () => this.getCurrentLocation());
    this.el.retryBtn?.addEventListener("click", () => this.retryLastSearch());
    this.el.locationInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchWeather();
    });

    // Unit toggle (delegated)
    document.addEventListener("click", (e) => {
      if (e.target.closest(".temp-unit")) this.toggleTemperatureUnit();
    });

    // theme toggle (cycles modes)
    this.el.themeToggle.addEventListener("click", () => {
      if (this.themeMode === "auto") this.setThemeMode("light");
      else if (this.themeMode === "light") this.setThemeMode("dark");
      else this.setThemeMode("auto");

      this.updateThemeToggleLabel();
    });

    // keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "l") {
          e.preventDefault();
          this.el.locationInput.focus();
        }
        if (e.key === "r") {
          e.preventDefault();
          location.reload();
        }
      }
    });
  }

  initPeriodic(){
    setInterval(()=>this.updateDateTime(), 60000); // minutes
    // Also check theme hourly
    setInterval(()=>{ if (this.themeMode==='auto') this.applyAutoTheme(); }, 60*60*1000);
  }

  updateDateTime(){
    const now = new Date();
    const opts = { weekday:'short', year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' };
    this.el.dateTime.textContent = now.toLocaleString(undefined, opts);
  }

  applyAutoTheme(){
    // If user chose manual mode, do not change
    if (this.themeMode !== 'auto') return;
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) document.body.classList.add('night');
    else document.body.classList.remove('night');
    this.updateThemeToggleLabel();
  }

  setThemeMode(mode){
    this.themeMode = mode; // 'auto' | 'light' | 'dark'
    if (mode === 'light') document.body.classList.remove('night');
    else if (mode === 'dark') document.body.classList.add('night');
    else this.applyAutoTheme();
  }

  updateThemeToggleLabel(){
    this.el.themeToggle.textContent = this.themeMode === 'auto' ? 'Auto' : (this.themeMode === 'light' ? 'Light' : 'Dark');
  }

  async getCurrentLocation(){
    if (!navigator.geolocation) {
      this.showError("Geolocation not supported. Search manually.");
      return;
    }
    try {
      this.showLoading();
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, enableHighAccuracy: true });
      });
      const { latitude, longitude } = pos.coords;
      this.lastQuery = { type: 'coords', lat: latitude, lon: longitude };
      await this.fetchWeatherByCoords(latitude, longitude);
    } catch (err) {
      console.warn("geolocation error", err);
      this.showError("Unable to get location. Try searching a city.");
    }
  }

  async searchWeather(){
    const q = this.el.locationInput.value.trim();
    if (!q) { this.showError("Please enter a city or ZIP code."); return; }
    this.lastQuery = { type: 'city', q };
    this.showLoading();
    await this.fetchWeatherByCity(q);
  }

  async retryLastSearch(){
    if (!this.lastQuery) return this.getCurrentLocation();
    if (this.lastQuery.type === 'coords') return this.fetchWeatherByCoords(this.lastQuery.lat, this.lastQuery.lon);
    return this.fetchWeatherByCity(this.lastQuery.q);
  }

  async fetchWeatherByCity(city){
    try {
      // *** Replace the mock below with a real fetch when you have an API key:
      // const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${this.apiKey}`);
      // const data = await res.json();

      const mock = this.generateMockWeatherData(city);
      await this.simulateAPIDelay();
      this.displayWeather(mock);
    } catch(e){
      console.error(e);
      this.showError("Unable to fetch weather. Please try again.");
    }
  }

  async fetchWeatherByCoords(lat, lon){
    try {
      // Replace with real fetch when available
      const mock = this.generateMockWeatherData("Current Location", lat, lon);
      await this.simulateAPIDelay();
      this.displayWeather(mock);
    } catch(e){
      console.error(e);
      this.showError("Unable to fetch weather. Please try again.");
    }
  }

  simulateAPIDelay(){ return new Promise(res => setTimeout(res, 700 + Math.random()*1000)); }

  generateMockWeatherData(location, lat = null, lon = null){
    const conditions = [
      { main:'Clear', description:'clear sky', icon:'01d', temp:26 },
      { main:'Clouds', description:'few clouds', icon:'02d', temp:22 },
      { main:'Rain', description:'light rain', icon:'10d', temp:18 },
      { main:'Snow', description:'light snow', icon:'13d', temp:-2 },
      { main:'Thunderstorm', description:'thunderstorm', icon:'11d', temp:20 }
    ];
    const c = conditions[Math.floor(Math.random()*conditions.length)];
    const base = c.temp;
    return {
      name: location === "Current Location" ? "Your Location" : location,
      sys: { country: "US" },
      coord: { lat: lat||40.7, lon: lon||-74.0 },
      main: { temp: base, feels_like: base + (Math.floor(Math.random()*7)-3), humidity: 45 + Math.floor(Math.random()*50), pressure: 1005 + Math.floor(Math.random()*45) },
      weather: [{ main: c.main, description: c.description, icon: c.icon }],
      wind: { speed: Math.floor(Math.random()*10)+2 },
      visibility: 8000 + Math.floor(Math.random()*7000),
      clouds: { all: Math.floor(Math.random()*100) },
      dt: Date.now()/1000,
      hourly: this.generateHourlyForecast(base)
    };
  }

  generateHourlyForecast(baseTemp){
    const arr = [];
    const now = new Date();
    for (let i=1;i<=24;i++){
      const t = new Date(now.getTime() + i*60*60*1000);
      const variation = Math.floor(Math.random()*9)-4;
      arr.push({
        dt: Math.floor(t.getTime()/1000),
        main: { temp: baseTemp + variation },
        weather: [{ description: (variation>0?'clear sky':'cloudy'), icon: this.getIconForTime(t) }]
      });
    }
    return arr;
  }

  getIconForTime(date){
    const hour = date.getHours();
    return (hour >= 6 && hour < 18) ? '01d' : '01n';
  }

  displayWeather(data){
    this.currentLocationData = data;
    // hide loading / error
    this.el.loading.style.display = 'none';
    this.el.errorMessage.style.display = 'none';
    this.el.weatherCard.style.display = 'block';

    // animate small entrance
    const card = this.el.weatherCard;
    card.style.opacity = '0';
    card.style.transform = 'translateY(12px)';
    setTimeout(()=>{ card.style.transition = 'all .4s ease'; card.style.opacity='1'; card.style.transform='translateY(0)'; }, 80);

    // fill fields
    this.el.cityName.textContent = data.name;
    this.el.country.textContent = data.sys?.country || '';
    this.el.temperature.textContent = Math.round(data.main.temp);
    this.el.feelsLike.textContent = Math.round(data.main.feels_like);
    this.el.weatherDescription.textContent = data.weather[0].description;
    const icon = data.weather[0].icon || '01d';
    this.el.weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    this.el.weatherIcon.alt = data.weather[0].description;

    this.el.visibility.textContent = `${(data.visibility/1000).toFixed(1)} km`;
    this.el.humidity.textContent = `${data.main.humidity}%`;
    this.el.windSpeed.textContent = `${data.wind.speed} m/s`;
    this.el.pressure.textContent = `${data.main.pressure} hPa`;
    this.el.uvIndex.textContent = Math.floor(Math.random()*11);
    this.el.cloudCover.textContent = `${data.clouds.all}%`;

    // forecast
    this.displayForecast(data.hourly || []);
    // animate detail items lightly
    this.animateDetailItems();
    // add particles if special
    if (data.weather[0].main === 'Rain') this.createWeatherParticles('Rain');
    if (data.weather[0].main === 'Snow') this.createWeatherParticles('Snow');
  }

  displayForecast(hourly){
    const c = this.el.forecastContainer;
    c.innerHTML = '';
    hourly.slice(0,24).forEach((h, idx) => {
      const d = new Date(h.dt*1000);
      const time = d.getHours().toString().padStart(2,'0') + ':00';
      const item = document.createElement('div');
      item.className = 'forecast-item';
      item.style.animationDelay = `${idx*40}ms`;
      item.innerHTML = `
        <div class="forecast-time">${time}</div>
        <img src="https://openweathermap.org/img/wn/${h.weather[0].icon}.png" alt="${h.weather[0].description}">
        <div class="forecast-temp">${Math.round(h.main.temp)}°</div>
        <div class="forecast-desc">${h.weather[0].description}</div>
      `;
      c.appendChild(item);
    });
  }

  animateDetailItems(){
    const items = document.querySelectorAll('.detail-item');
    items.forEach((it,i)=>{
      it.style.opacity='0'; it.style.transform='translateX(-10px)';
      setTimeout(()=>{ it.style.transition='all .35s ease'; it.style.opacity='1'; it.style.transform='translateX(0)'; }, 80 + i*60);
    });
  }

  showLoading(){ this.el.loading.style.display='flex'; this.el.weatherCard.style.display='none'; this.el.errorMessage.style.display='none'; }
  showError(msg){ this.el.loading.style.display='none'; this.el.weatherCard.style.display='none'; this.el.errorMessage.style.display='block'; this.el.errorText.textContent = msg; }

  toggleTemperatureUnit(){
    const tempEl = this.el.temperature;
    const feelsEl = this.el.feelsLike;
    const unitBtn = document.querySelector('.temp-unit');

    if (!tempEl.textContent) return;
    if (unitBtn.textContent.trim() === '°C' || unitBtn.textContent.trim() === '°') {
      // to F
      const c = parseInt(tempEl.textContent);
      const f = Math.round((c*9)/5+32);
      tempEl.textContent = f;
      const fc = parseInt(feelsEl.textContent);
      feelsEl.textContent = Math.round((fc*9)/5+32);
      unitBtn.textContent = '°F';
    } else {
      // to C
      const f = parseInt(tempEl.textContent);
      const c = Math.round((f-32)*5/9);
      tempEl.textContent = c;
      const fc = parseInt(feelsEl.textContent);
      feelsEl.textContent = Math.round((fc-32)*5/9);
      unitBtn.textContent = '°C';
    }
  }

  initializeForecastScroll(){
    const container = this.el.forecastContainer;
    if (!container) return;
    let isDown=false, startX, scrollLeft;
    container.addEventListener('mousedown', (e)=>{
      isDown=true; container.classList.add('grabbing');
      startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft;
    });
    container.addEventListener('mouseleave', ()=>{ isDown=false; container.classList.remove('grabbing'); });
    container.addEventListener('mouseup', ()=>{ isDown=false; container.classList.remove('grabbing'); });
    container.addEventListener('mousemove', (e)=>{
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.6;
      container.scrollLeft = scrollLeft - walk;
    });
  }

  // Simple particle overlays (non-invasive)
  createWeatherParticles(condition){
    // remove old
    const prev = document.querySelector('.weather-particles');
    if (prev) prev.remove();

    const container = document.createElement('div');
    container.className = 'weather-particles';
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden';
    document.body.appendChild(container);

    if (condition === 'Rain') {
      for (let i=0;i<40;i++){
        const drop = document.createElement('div');
        drop.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${-10-Math.random()*30}vh;width:2px;height:${8+Math.random()*18}px;background:rgba(255,255,255,0.12);transform:translateY(0);animation:rain ${0.8+Math.random()*1.5}s linear infinite;animation-delay:${Math.random()*1}s`;
        container.appendChild(drop);
      }
      if (!document.getElementById('rain-frames')){
        const s = document.createElement('style'); s.id='rain-frames';
        s.textContent = `@keyframes rain{0%{transform:translateY(-120vh)}100%{transform:translateY(130vh)}}`;
        document.head.appendChild(s);
      }
    }

    if (condition === 'Snow') {
      for (let i=0;i<30;i++){
        const f = document.createElement('div');
        f.style.cssText = `position:absolute;left:${Math.random()*100}%;top:${-10-Math.random()*30}vh;width:${4+Math.random()*8}px;height:${4+Math.random()*8}px;background:rgba(255,255,255,0.9);border-radius:50%;animation:snow ${3+Math.random()*3}s linear infinite;animation-delay:${Math.random()*2}s;opacity:.9`;
        container.appendChild(f);
      }
      if (!document.getElementById('snow-frames')){
        const s = document.createElement('style'); s.id='snow-frames';
        s.textContent = `@keyframes snow{0%{transform:translateY(-120vh)}100%{transform:translateY(120vh) translateX(60px)}}`;
        document.head.appendChild(s);
      }
    }
  }

  // voice search
  initializeVoiceSearch(){
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.interimResults = false; recognition.lang='en-US'; recognition.continuous=false;
    // add button to search-box
    const voiceBtn = document.createElement('button');
    voiceBtn.className='icon-btn voice-btn';
    voiceBtn.title='Voice search'; voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    document.querySelector('.search-box').appendChild(voiceBtn);

    voiceBtn.addEventListener('click', ()=>{
      recognition.start();
      voiceBtn.style.transform = 'scale(.96)'; voiceBtn.disabled = true;
    });

    recognition.addEventListener('result', (ev)=>{
      const transcript = ev.results[0][0].transcript;
      this.el.locationInput.value = transcript;
      this.searchWeather();
    });
    recognition.addEventListener('end', ()=>{
      const vb = document.querySelector('.voice-btn');
      if (vb){ vb.style.transform=''; vb.disabled=false; }
    });
  }
}

/* Initialize when DOM loaded */
document.addEventListener('DOMContentLoaded', ()=>{
  const app = new WeatherApp();

  // set initial text on unit button
  document.querySelectorAll('.temp-unit').forEach(btn=> btn.textContent = '°C');

  // small helper for clicking unit text (also delegated within class)
  document.addEventListener('click', (e)=>{
    if (e.target.classList.contains('temp-unit')) app.toggleTemperatureUnit();
  });

  // fallback: hide loading after a moment if nothing happens
  setTimeout(()=> {
    const ld = document.getElementById('loading');
    if (ld && ld.style.display !== 'none') ld.style.opacity = '1';
  }, 1200);
});
