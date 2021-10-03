import axios from 'axios';

const API = axios.create({
    //baseURL: 'https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=-99.0007&latitude=36.8380&format=JSON&start=1981&end=2020&user=DAV'
    baseURL: 'https://power.larc.nasa.gov/api/',
    headers: {
        Accept: 'application/json',
    }
});



export default API;