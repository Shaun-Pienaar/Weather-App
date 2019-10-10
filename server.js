const express = require ('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/getInfo', async (req, res) => {
    let country = req.body.country;
    let city = req.body.city;
    let date = req.body.date;
    let units = req.body.units;
    if(country && city && date){
        let info = await getWeather(country, city, date, units);
        if(info === 'failed'){
            res.status(422).send('City not found');
        }
        else if(info === 'not found'){
            res.status(400).send('Invalid date. Weather not available');
        }
        else{
            res.json(info);
        }
    }
    else{
        res.status(400).send('Incorrect or incomplete parameters');
    }
});

app.listen(port, () => console.log(`Listening on port:${port}!`));

async function getGpsLocation(country, city){
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.Locationiq_API_KEY}&country=${country}&city=${city}&format=json`;
    let response = await fetch(url);
    let info = await response.json();
    if(info.error){
        return info;
    }
    else{
        return info[0];
    }
}

async function getWeather(country, city, date, units){
    let locationInfo = await getGpsLocation(country, city);
    if(locationInfo.error){
        return 'failed';
    }
    else{
        let unit;
        if(units === 'imperial'){
            unit = 'us';
        }
        else{
            unit = 'ca';
        }
        let url = `https://api.darksky.net/forecast/${process.env.DarkSky_API_KEY}/${locationInfo.lat},${locationInfo.lon},${date}T12:00:00?exclude=currently,hourly,flags&units=${unit}`;
        let response = await fetch(url);
        let info = await response.json();
        if(info.error){
            return 'not found';
        }
        else{
            return info;
        }
    }
}