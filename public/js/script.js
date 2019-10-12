async function submitInfo(){
  let processingText = document.getElementById('processingText');
  processingText.innerHTML = 'Processing';
  processingText.style.color = 'darkblue';
  processingText.style.display = 'block';
  //Select elements
  let country = document.getElementById('countryInput').value;
  let city = document.getElementById('cityInput').value;
  let date = document.getElementById('dateInput').value;
  let unitsInput = document.getElementsByName('units');
  let units;
  for(let i = 0; i < unitsInput.length; i++){
    if(unitsInput[i].checked){
      units = unitsInput[i].value;
      break;
    }
  }
  //Make request
  let res = await makeRequest(country, city, date, units);
  //Read response
  let info = await readResponse(res);
  //Check for errors
  let error = handleErrors(info);
  //Display result
  if(error === null){
    setResults(info.daily.data[0], units);
    let result = document.getElementsByClassName('result');
    for(let i = 0; i < result.length; i++){
      result[i].style.display = 'flex';
    }
    processingText.style.display = 'none';
  }
}

async function makeRequest(country, city, date, units){
  let reqBody = {country:country, city:city, date:date, units:units};
  req = {
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body: JSON.stringify(reqBody)
  };
  let res = await fetch('getInfo', req);
  return res;
}

async function readResponse(res){
  if(res.status === 200){
    let info = await res.json();
    return info;
  }
  else{
    if(res.status === 400){
      console.error('Incorrect or incomplete parameters');
      return 1;
    }
    else if(res.status === 422){
      console.error('City not found');
      return 2;
    }
    else{
      console.error('Bad Request');
      console.log('Error code: ' + res.status);
      return 3;
    }
  }
}

function handleErrors(info){
  let output = document.getElementById('processingText');
  if(info === 1){
    output.style.color = 'red';
    output.innerHTML = 'Incomplete or incorrect parameters';
    return 'Error 1';
  }
  else if(info === 2){
    output.style.color = 'red';
    output.innerHTML = 'City not found';
    return 'Error 2';
  }
  else if(info === 3){
    output.style.color = 'red';
    output.innerHTML = 'Unexpected error';
    return 'Error 3';
  }
  else{
    return null;
  }
}

function setResults(data, units){
  setForecast(data.icon, data.summary);
  setTemperature(Math.round(data.temperatureLow), Math.round(data.temperatureHigh), units);
  setPercipitation(data.precipProbability, data.precipType);
  setWind(data.windSpeed, data.windBearing, units);
  setHumidity(data.humidity);
  setSunTime(data.sunriseTime, data.sunsetTime);
}

function setForecast(iconString, summary){
  let image = document.getElementById('forecastImage');
  let text = document.getElementById('forecastText');
  switch(iconString){
    case 'partly-cloudy-day':
      image.src = 'images/PartlyCloudy.png';
      break;
    case 'partly-cloudy-night':
      image.src = 'images/Sunny.png';
      break;
    case 'clear-day':
      image.src = 'images/Sunny.png';
      break;
    case 'clear-night':
      image.src = 'images/Sunny.png';
      break;
    case 'rain':
      image.src = 'images/Rain.png';
      break;
    case 'snow':
      image.src = 'images/Snow.png';
      break;
    case 'sleet':
      image.src = 'images/HeavyRain.png';
      break;
    case 'cloudy':
      image.src = 'images/Cloudy.png';
      break;
    case 'wind':
      image.src = 'images/PartlyCloudy.png';
      break;
    case 'fog':
      image.src = 'images/Cloudy.png';
      break;
    default:
      image.src = 'images/Storm.png';
      break;
  }
  text.innerHTML = summary;
}

function setTemperature(low, high, units){
  let tempMinText = document.getElementById('temperatureMinText');
  let tempMinImage = document.getElementById('temperatureMinImage');
  let tempMaxText = document.getElementById('temperatureMaxText');
  let tempMaxImage = document.getElementById('temperatureMaxImage');
  if(units === 'imperial'){
    tempMinImage.src = 'images/farenheit.png';
    tempMinImage.alt = 'F';
    tempMaxImage.src = 'images/farenheit.png';
    tempMaxImage.alt = 'F';
  }
  else{
    tempMinImage.src = 'images/celcius.png';
    tempMinImage.alt = 'C';
    tempMaxImage.src = 'images/celcius.png';
    tempMaxImage.alt = 'C';
  }
  tempMinText.innerHTML = 'Min: ' + low;
  tempMaxText.innerHTML = 'Max: ' + high;
}

function setPercipitation(probability, type){
  let image = document.getElementById('percipitationImage');
  let text = document.getElementById('percipitationText');
  switch(type){
    case 'snow':
      image.src = 'images/Snow.png';
      image.alt = 'Snow';
      break;
    case 'sleet':
      image.src = 'images/Hail.png';
      image.alt = 'Hail';
      break;
    default:
      image.src = 'images/Rain.png';
      image.alt = 'Rain';
      break;
  }
  if(type === undefined){
    text.innerHTML = Math.round(probability * 100) + '% chance for rain';
  }
  else{
    text.innerHTML = Math.round(probability * 100) + '% chance for ' + type;
  }
}

function setWind(speed, bearing, units){
  let text = document.getElementById('windText');
  let image = document.getElementById('windImage');
  if(units === 'imperial'){
    text.innerHTML = speed + ' miles per hour';
  }
  else{
    text.innerHTML = speed + ' kilometers per hour';
  }
  if(bearing > 338 || bearing <= 23){
    image.src = 'images/S.png';
    image.alt = 'South';
  }
  else if(bearing > 23 && bearing <= 68){
    image.src = 'images/SW.png';
    image.alt = 'South-West';
  }
  else if(bearing > 68 && bearing <= 113){
    image.src = 'images/W.png';
    image.alt = 'West';
  }
  else if(bearing > 113 && bearing <= 158){
    image.src = 'images/NW.png';
    image.alt = 'North-West';
  }
  else if(bearing > 158 && bearing <= 203){
    image.src = 'images/N.png';
    image.alt = 'North';
  }
  else if(bearing > 203 && bearing <= 248){
    image.src = 'images/NE.png';
    image.alt = 'North-East';
  }
  else if(bearing > 248 && bearing <= 293){
    image.src = 'images/E.png';
    image.alt = 'East';
  }
  else{
    image.src = 'images/SE.png';
    image.alt = 'South-East';
  }
}

function setHumidity(humidity){
  let text = document.getElementById('humidityText');
  text.innerHTML = Math.round(humidity * 100) + '%';
}

function setSunTime(sunrise, sunset){
  sunriseText = document.getElementById('sunriseText');
  sunsetText = document.getElementById('sunsetText');
  let dateTime = toDateTime(sunrise);
  let hours = dateTime.getHours();
  let minutes = dateTime.getMinutes();
  sunriseText.innerHTML = 'Time: ' + hours + ':' + minutes + ' GMT';
  dateTime = toDateTime(sunset);
  hours = dateTime.getHours();
  minutes = dateTime.getMinutes();
  sunsetText.innerHTML = 'Time: ' + hours + ':' + minutes + ' GMT';
}

function toDateTime(secs) {
  var t = new Date(1970, 0, 1); // Epoch
  t.setSeconds(secs);
  return t;
}