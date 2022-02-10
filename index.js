
import {} from 'dotenv/config';
import request from 'request-promise';
import ObjectsToCsv  from 'objects-to-csv';
import minimist from 'minimist';

const cities = minimist(process.argv.slice(2));
const apiKey = process.env.API_KEY

const saveWeatherForCitiesCsvFile = async () => {
    try {
        const results = await getWeatherForCities(); 
        const aa = saveToCsvFile(results);
        saveToCsvFile(aa);
      } catch(e) {
        console.log(e.message);
     }
}

const getWeatherForCities = () => {
    try {
        return Promise.all(arrayPromise()); 
      } catch(e) {
          throw new error(e);
     }
}

const arrayPromise = () =>  argv.splice(2).map(arg => getFetch(arg));


const getFetch = (city) => { 
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`
    return request(url).then((response) => JSON.parse(response)).then((response) => {
        return {
            city,
            list:response.list,
            response
        }
    });
} 

const ss = (results) => {
    const resultsGroupedByDateAndCity = getGroupedByDateAndCity(results);
    const csvLines = []
    console.log(resultsGroupedByDateAndCity);

    for (let [date, obj] of Object.entries(resultsGroupedByDateAndCity)) {
        let dailySummary = Object.entries(obj).map(([city, dayList]) => {  
            return { city,
            maxTemperature: getMaxTemperatureCelsius(dayList),
            minTemperature: getMinTemperatureCelsius(dayList),
            totalRainfall: getTotalRainFall(dayList)
        }});

        let resultWithHighestTemperature = [...dailySummary].sort((resA, resB) => resB.maxTemperature - resA.maxTemperature)[0];
        let resultWithLowestTemperature = [...dailySummary].sort((resA, resB) => resA.minTemperature - resB.minTemperature)[0];
        let citiesWithRain = dailySummary.filter(res => res.totalRainfall).map(res => res.city);
      
        getDailySummary.push({
            'Day':date, 
            'City with highest temperature': resultWithHighestTemperature.city, 
            'City with Lowest temperature': resultWithLowestTemperature.city,
            'Cities with rain': citiesWithRain.toString()
        });
    }
    return csvLines
}

const getGroupedByDateAndCity = (results) => {
    const resultsGroupedByDateAndCity = []
    results.forEach(result => {
        result.list.forEach(entry => {
            let timeOffset = entry.dt + result.response.city.timezone;
            let date = new Date(timeOffset * 1000);
            date.setHours(0,0,0,0);
            let dateKey = date.toISOString().substring(0,10);
            if (!resultsGroupedByDateAndCity[dateKey]) resultsGroupedByDateAndCity[dateKey] = {};
            if (!resultsGroupedByDateAndCity[dateKey][result.city]) resultsGroupedByDateAndCity[dateKey][result.city] = [];
            resultsGroupedByDateAndCity[dateKey][result.city].push(entry);
        });
    });
    return resultsGroupedByDateAndCity;
}


const getMaxTemperatureCelsius = (responseList) => {
    const maxTemps = responseList.map(entry => Number(entry.main.temp_max));
    return Math.max(...maxTemps);
}

const getMinTemperatureCelsius = (responseList) => {
    const minTemps = responseList.map(entry => Number(entry.main.temp_min));
    return Math.min(...minTemps);
}

function getTotalRainFall(responseList) {
    const rain = responseList.map(entry => { return entry.rain ? Number(entry.rain["3h"]): 0 });
    return rain.reduce((sum, val) => sum + val, 0)
}

const saveToCsvFile = async (list) => {
    const csv = new ObjectsToCsv(list)
    try {
       await csv.toDisk('./list.csv')
       console.log("Csv:", csv.toString())
    } catch(e) {
        throw new error('');
    }
}

saveWeatherForCitiesCsvFile();

