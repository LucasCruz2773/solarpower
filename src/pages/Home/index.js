import React, { useEffect, useState } from 'react';
import {Dimensions, StyleSheet, View, Text, Image, ActivityIndicator} from 'react-native'
import MapView, { Circle, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';
import API from '../../api';
import Slider from '@react-native-community/slider';
import dataPosts from '../../../data/posts.js';
import { TouchableOpacity } from 'react-native-gesture-handler';


export default function Home(){
    const [myLatitude, setMyLatitude] = useState(0);
    const [myLongitude, setMyLongitude] = useState(0);
    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
    });

    const [showTutorial, setShowTutorial] = useState(true);

    const [mySquares, setMySquares] = useState([]);

    const [kmSquare, setKmSquare] = useState(10);
    const [loading, setLoading] = useState(false);
    const [powerIntervals, setPowerIntervals] = useState([]);
    const [showInfo, setShowInfo] = useState(false);
    const [powerSelected, setPowerSelected] = useState(0);
    const [lineSelected, setLineSelected] = useState(0);

    const [lineImportance, setLineImportance] = useState(0);

    const colorNivel = [
        "rgba(255, 224, 178, 0.4)",
        "rgba(255, 204, 128, 0.4)",
        "rgba(255, 183, 77, 0.4)",
        "rgba(255, 167, 38, 0.4)",
        "rgba(255, 152, 0, 0.4)",
        "rgba(251, 140, 0, 0.4)",
        "rgba(245, 124, 0, 0.4)",
        "rgba(239, 108, 0, 0.4)",
        "rgba(230, 81, 0, 0.4)",
    ];

    function setArray(km, cord) {        
        return [cord - km * 0.009, cord, cord + km * 0.009];
    }

    function getDayLight(lat) {
    
        if (lat < -90) return 12.01;
        if (lat < -80) return 12.1;
        if (lat < -70) return 12.2;
        if (lat < -68) return 12.4;
        if (lat < -63) return 12.2;
        if (lat < -55) return 12.17;
        if (lat < -50) return 12.1;
    
        if (lat < 10) return 12.1;
        if (lat < 20) return 12.15;
        if (lat < 30) return 12.18;
        if (lat < 40) return 12.2;
        if (lat < 50) return 12.25;
        if (lat < 55) return 12.3; 
        if (lat < 60) return 12.4;
        if (lat < 64) return 12.5;
        if (lat < 70) return 12.7;
        if (lat < 90) return 12.55;
    }



    function complement(lat, long, km) {

        var lat_array = setArray(km/2, lat);
        var long_array = setArray(km/2, long);
        
    
        var findPost = 0;
        dataPosts.features.map(x => {
            if ( 
                (x.geometry.coordinates[1] >= lat_array[0] && x.geometry.coordinates[1] <= lat_array[2]) &&
                (x.geometry.coordinates[0] >= long_array[0] && x.geometry.coordinates[0] <= long_array[2])
            )
            findPost = 1;
        });
        console.log(findPost);
        return findPost;
    
        /* foreach (data->features as f) {
            if ( 
                (f->geometry->coordinates[1] >= lat_array[0] && f->geometry->coordinates[1] <= lat_array[2]) &&
                (f->geometry->coordinates[0] >= long_array[0] && f->geometry->coordinates[0] <= long_array[2])
            )
            return 1;
        }
        return 0; */
    }

    async function getCoefficient(lat, long) {
    
        return await API.get("temporal/monthly/point?parameters=T2M,ALLSKY_SFC_SW_DWN&community=RE&longitude=" + long + "&latitude=" + lat + "&format=JSON&start=2010&end=2020")
            .then((res) => {
                const req = res.data;
                //iradiance
                let sum = 0;
                let count = 0;

                Object.keys(req.properties.parameter.ALLSKY_SFC_SW_DWN).forEach((value) => {
                    sum = sum + req.properties.parameter.ALLSKY_SFC_SW_DWN[value];
                    count += 1;
                });
                irradiance = sum/count;
                
                //Temperature
                sum = 0;
                count = 0;
                Object.keys(req.properties.parameter.T2M).forEach((value) => {
                    sum = sum + req.properties.parameter.T2M[value];
                    count += 1;
                })
                temp = sum/count; 
            
                //Day light
                var dayLight = getDayLight(lat);
            
                var panelTemp = temp + (0.03677 * irradiance * 1000) / dayLight + 0.6549;
                var efficiency = 100 - (panelTemp - 25) * 0.13 ;
                //return power
                return (irradiance/dayLight) * 1000 * (efficiency/100);

            })
            .catch((err) => {
                console.log(err)
            })

    }

    async function getBasic(km, lat, long, comp) {
        var lat_array = setArray(km, lat);
        var long_array = setArray(km, long);
        
        var basic_return = [];
        basic_return.push(await getCoefficient(lat_array[2], long_array[0]));
        basic_return.push(await getCoefficient(lat_array[2], long_array[1]));
        basic_return.push(await getCoefficient(lat_array[2], long_array[2]));
        basic_return.push(await getCoefficient(lat_array[1], long_array[0]));
        basic_return.push(await getCoefficient(lat_array[1], long_array[1]));
        basic_return.push(await getCoefficient(lat_array[1], long_array[2]));
        basic_return.push(await getCoefficient(lat_array[0], long_array[0]));
        basic_return.push(await getCoefficient(lat_array[0], long_array[1]));
        basic_return.push(await getCoefficient(lat_array[0], long_array[2]));
    
        var comp_return = [];
        if (comp == true) {
            comp_return.push(complement(lat_array[2], long_array[0], km));
            comp_return.push(complement(lat_array[2], long_array[1], km));
            comp_return.push(complement(lat_array[2], long_array[2], km));
            comp_return.push(complement(lat_array[1], long_array[0], km));
            comp_return.push(complement(lat_array[1], long_array[1], km));
            comp_return.push(complement(lat_array[1], long_array[2], km));
            comp_return.push(complement(lat_array[0], long_array[0], km));
            comp_return.push(complement(lat_array[0], long_array[1], km));
            comp_return.push(complement(lat_array[0], long_array[2], km));
        }
    
        return_obj = {
            basic: basic_return,
            comp: comp_return
        };
        
        return return_obj;
        
    }
    
    
    

    useEffect(()=> {
        Geolocation.getCurrentPosition(info => {
            setMyLatitude(info.coords.latitude);
            setMyLongitude(info.coords.longitude);
            setRegion({
                latitude: info.coords.latitude,
                longitude: info.coords.longitude,
                latitudeDelta: 0.002,
                longitudeDelta: 0.001,
            })
        });

    }, []);

    const changeRegion = (data) => {
        setRegion(data)
    }

    const maxMinValue = (squares) => {
        let max = 0, min = 9999;
        squares.map((square) => {
            if(square.value < min){
                min = square.value;
            }
            if(square.value > max){
                max = square.value;
            }
        })
        return [max, min];
    }
    
    const showValues = (event) => {
        let squareLatitude = event.nativeEvent.coordinate.latitude;
        let squareLongitude = event.nativeEvent.coordinate.longitude;
        mySquares.map((square) => {
            if(
                squareLongitude > square.longitude-(kmSquare*0.009)/2
                && squareLongitude < square.longitude+(kmSquare*0.009)/2
                && squareLatitude > square.latitude-(kmSquare*0.009)/2
                && squareLatitude < square.latitude + (kmSquare*0.009)/2
            ){
                setLineSelected(square.findPost);
                setPowerSelected(square.value);
                setShowInfo(true);
            }
        })

    }

    const changeColorSquares = (data) => {
        setLineImportance(data);
        // let newSquares = mySquares.map((square) => {
        //     if(square.findPost){
        //         square.value = square.value * (1 + lineImportance/100);
        //         console.log(square.value);
        //     }
        //     return square;
        // });
        // let maxMin = [];
        
        // maxMin = maxMinValue(newSquares);
    
        // let interval = (maxMin[0] - maxMin[1])/9;
        // let allIntervals = [];
        // let squareWithColors = [];
        // for(let i = 0; i < 9; i++){
        //     allIntervals.push(
        //         {min: maxMin[1]+(interval * i), max: maxMin[1]+(interval* (i+1)), color: colorNivel[i]}
        //     )
        // }
        // for(let i = 0; i< 9; i++){
        //     newSquares = newSquares.map((square) => {
        //         if(square.findPost){
        //             if(square.value >= allIntervals[i].min && square.value <= allIntervals[i].max){
        //                 square.color = colorNivel[i];
        //             }
        //         } else {
        //             if(square.value >= allIntervals[i].min && square.value <= allIntervals[i].max){
        //                 square.color = colorNivel[i];
        //             }
        //         }
        //         return square;
        //     })
        // }
    }


    const onLocationSelect = async (event) => {
        let newSquares = mySquares.map((square) => square);
        let squareLatitude = event.nativeEvent.coordinate.latitude;
        let squareLongitude = event.nativeEvent.coordinate.longitude;
        let oldLatitude = 0;
        let oldLongitude = 0;
        let maxMin = [];
        setLoading(true);
        setShowInfo(false);
        getBasic(kmSquare, squareLatitude, squareLongitude, true).then((dataNasa) => {
            let notAdd = {
                topleft: 0,
                topcenter: 0,
                topright: 0,
                left: 0,
                center: 0,
                right: 0,
                bottomleft: 0,
                bottomcenter: 0,
                bottomright: 0,
            };
    
            let objTopLeft = { 
                latitude: squareLatitude+(kmSquare*0.009), 
                longitude: squareLongitude-(kmSquare*0.009), 
                value: dataNasa.basic[0],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[0],
            };
    
            let objTopCenter = { 
                latitude: squareLatitude+(kmSquare*0.009), 
                longitude: squareLongitude, 
                value: dataNasa.basic[1],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[1],
            }
    
            let objTopRight = { 
                latitude: squareLatitude+(kmSquare*0.009), 
                longitude: squareLongitude+(kmSquare*0.009), 
                value: dataNasa.basic[2],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[2],
            }
    
            let objLeft = { 
                latitude: squareLatitude, 
                longitude: squareLongitude-(kmSquare*0.009), 
                value: dataNasa.basic[3],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[3],
            }
    
            let objCenter = { 
                latitude: squareLatitude, 
                longitude: squareLongitude, 
                value: dataNasa.basic[4],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[4],
            }
    
            let objRight = { 
                latitude: squareLatitude, 
                longitude: squareLongitude+(kmSquare*0.009), 
                value: dataNasa.basic[5],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[5],
            }
    
            let objBottomLeft = { 
                latitude: squareLatitude-(kmSquare*0.009), 
                longitude: squareLongitude-(kmSquare*0.009), 
                value: dataNasa.basic[6],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[6],
            }
    
            let objBottomCenter = { 
                latitude: squareLatitude-(kmSquare*0.009), 
                longitude: squareLongitude, 
                value: dataNasa.basic[7],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[7],
            }
    
            let objBottomRight = { 
                latitude: squareLatitude-(kmSquare*0.009), 
                longitude: squareLongitude+(kmSquare*0.009), 
                value: dataNasa.basic[8],
                color: colorNivel[0],
                km: kmSquare,
                findPost: dataNasa.comp[8],
            }
            
            mySquares.map((square) => {
                if(
                    objTopLeft.longitude > square.longitude-(kmSquare*0.009)/2
                    && objTopLeft.longitude < square.longitude+(kmSquare*0.009)/2
                    && objTopLeft.latitude > square.latitude-(kmSquare*0.009)/2
                    && objTopLeft.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.topleft = 1;
                }
    
                if(
                    objTopCenter.longitude > square.longitude-(kmSquare*0.009)/2
                    && objTopCenter.longitude < square.longitude+(kmSquare*0.009)/2
                    && objTopCenter.latitude > square.latitude-(kmSquare*0.009)/2
                    && objTopCenter.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.topcenter = 1;
                }
    
                if(
                    objTopRight.longitude > square.longitude-(kmSquare*0.009)/2
                    && objTopRight.longitude < square.longitude+(kmSquare*0.009)/2
                    && objTopRight.latitude > square.latitude-(kmSquare*0.009)/2
                    && objTopRight.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.topright = 1;
                }
    
                if(
                    objLeft.longitude > square.longitude-(kmSquare*0.009)/2
                    && objLeft.longitude < square.longitude+(kmSquare*0.009)/2
                    && objLeft.latitude > square.latitude-(kmSquare*0.009)/2
                    && objLeft.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.left = 1;
                }
    
                if(
                    objCenter.longitude > square.longitude-(kmSquare*0.009)/2
                    && objCenter.longitude < square.longitude+(kmSquare*0.009)/2
                    && objCenter.latitude > square.latitude-(kmSquare*0.009)/2
                    && objCenter.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.center = 1;
                    oldLatitude = square.latitude;
                    oldLongitude = square.longitude;
                }
    
                if(
                    objRight.longitude > square.longitude-(kmSquare*0.009)/2
                    && objRight.longitude < square.longitude+(kmSquare*0.009)/2
                    && objRight.latitude > square.latitude-(kmSquare*0.009)/2
                    && objRight.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.right = 1;
                }
    
                if(
                    objBottomLeft.longitude > square.longitude-(kmSquare*0.009)/2
                    && objBottomLeft.longitude < square.longitude+(kmSquare*0.009)/2
                    && objBottomLeft.latitude > square.latitude-(kmSquare*0.009)/2
                    && objBottomLeft.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.bottomleft = 1;
                }
    
                if(
                    objBottomCenter.longitude > square.longitude-(kmSquare*0.009)/2
                    && objBottomCenter.longitude < square.longitude+(kmSquare*0.009)/2
                    && objBottomCenter.latitude > square.latitude-(kmSquare*0.009)/2
                    && objBottomCenter.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.bottomcenter = 1;
                }
    
                if(
                    objBottomRight.longitude > square.longitude-(kmSquare*0.009)/2
                    && objBottomRight.longitude < square.longitude+(kmSquare*0.009)/2
                    && objBottomRight.latitude > square.latitude-(kmSquare*0.009)/2
                    && objBottomRight.latitude < square.latitude + (kmSquare*0.009)/2
                ){
                    notAdd.bottomright = 1;
                }
            })
    
            if(notAdd.center){
                objTopLeft = { 
                    latitude: oldLatitude+(kmSquare*0.009), 
                    longitude: oldLongitude-(kmSquare*0.009), 
                    value: dataNasa.basic[0],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[0],
                };
        
                objTopCenter = { 
                    latitude: oldLatitude+(kmSquare*0.009), 
                    longitude: oldLongitude, 
                    value: dataNasa.basic[1],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[1],
                }
        
                objTopRight = { 
                    latitude: oldLatitude+(kmSquare*0.009), 
                    longitude: oldLongitude+(kmSquare*0.009), 
                    value: dataNasa.basic[2],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[2],
                }
        
                objLeft = { 
                    latitude: oldLatitude, 
                    longitude: oldLongitude-(kmSquare*0.009), 
                    value: dataNasa.basic[3],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[3],
                }
        
                objCenter = { 
                    latitude: oldLatitude, 
                    longitude: oldLongitude, 
                    value: dataNasa.basic[4],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[4],
                }
        
                objRight = { 
                    latitude: oldLatitude, 
                    longitude: oldLongitude+(kmSquare*0.009), 
                    value: dataNasa.basic[5],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[5],
                }
        
                objBottomLeft = { 
                    latitude: oldLatitude-(kmSquare*0.009), 
                    longitude: oldLongitude-(kmSquare*0.009), 
                    value: dataNasa.basic[6],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[6],
                }
        
                objBottomCenter = { 
                    latitude: oldLatitude-(kmSquare*0.009), 
                    longitude: oldLongitude, 
                    value: dataNasa.basic[7],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[7],
                }
        
                objBottomRight = { 
                    latitude: oldLatitude-(kmSquare*0.009), 
                    longitude: oldLongitude+(kmSquare*0.009), 
                    value: dataNasa.basic[8],
                    color: colorNivel[0],
                    km: kmSquare,
                    findPost: dataNasa.comp[8],
                }
            }
    
            if(!notAdd.topleft){
                newSquares.push(objTopLeft)
            }
            if(!notAdd.topcenter){
                newSquares.push(objTopCenter);
            }
            if(!notAdd.topright){
                newSquares.push(objTopRight);
            }
            if(!notAdd.left){
                newSquares.push(objLeft);
            }
            if(!notAdd.center){
                newSquares.push(objCenter);
            }
            if(!notAdd.right){
                newSquares.push(objRight);
            }
            if(!notAdd.bottomleft){
                newSquares.push(objBottomLeft);
            }
            if(!notAdd.bottomcenter){
                newSquares.push(objBottomCenter);
            }
            if(!notAdd.bottomright){
                newSquares.push(objBottomRight);
            }

            let squaresToColor = [];
            newSquares.map((square) => {
                squaresToColor.push(square)
            });

            squaresToColor = squaresToColor.map((square) => {
                if(square.findPost){
                    square.value = square.value * (1+lineImportance/100);
                }
                return square;
            })
    
            maxMin = maxMinValue(squaresToColor);
            realMaxMin = maxMinValue(newSquares);
    
            let interval = (maxMin[0] - maxMin[1])/9;
            let realInterval = (realMaxMin[0] - realMaxMin[1])/9;
            let allIntervals = [];
            let realIntervals = [];

            for(let i = 0; i < 9; i++){
                realIntervals.push(
                    {min: realMaxMin[1]+(realInterval * i), max: realMaxMin[1]+(realInterval* (i+1)), color: colorNivel[i]}
                )
            }

            for(let i = 0; i < 9; i++){
                allIntervals.push(
                    {min: maxMin[1]+(interval * i), max: maxMin[1]+(interval* (i+1)), color: colorNivel[i]}
                )
            }
            for(let i = 0; i< 9; i++){
                squaresToColor = squaresToColor.map((square) => {
                    if(square.value >= allIntervals[i].min && square.value <= allIntervals[i].max){
                        square.color = colorNivel[i];
                    }
                    return square;
                })
            }

            for(let i = 0; i < newSquares.length; i++ ){
                newSquares[i].color = squaresToColor[i].color;
            }

            newSquares = squaresToColor.map((square) => {
                if(square.findPost){
                    square.value = square.value / (1+lineImportance/100);
                }
                return square;
            })

            realMaxMin = maxMinValue(newSquares);
            realInterval = (realMaxMin[0] - realMaxMin[1])/9;
            realIntervals = [];
            for(let i = 0; i < 9; i++){
                realIntervals.push(
                    {min: realMaxMin[1]+(realInterval * i), max: realMaxMin[1]+(realInterval* (i+1)), color: colorNivel[i]}
                )
            }

            setPowerIntervals(realIntervals);
            setLoading(false);
            setMySquares(newSquares);
        });
        
    }

    const cleanAll = () => {
        setMySquares([]);
        setShowInfo(false);
    }

    return (   
        <> 
        {showTutorial ?
        <View style={styles.tutorial}>
            <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoTutorial}
            />
            <View style={styles.instructionsTitle}>
                <Text style={{fontSize: 26, color: '#FFF'}}>INSTRUCTIONS</Text>
            </View>
            <View style={styles.allInstructions}>
                <Text style={styles.instruction}>
                    <Text style={{fontWeight: 'bold'}}>- 2 clicks </Text>
                    on the map it will load all data of the selected area.
                </Text>

                <Text style={styles.instruction}>
                    <Text style={{fontWeight: 'bold'}}>- 1 click </Text>
                    on a selected area will show its details.
                </Text>

                <Text style={styles.instruction}>
                    - Slider 
                    <Text style={{fontWeight: 'bold'}}>"Square Size" </Text>
                    defines the size of the selected area.
                </Text>
                <Text style={styles.instruction}>
                    - Slider 
                    <Text style={{fontWeight: 'bold'}}>"Power lines relevance" </Text>
                    defines how much the distribution of eletricity will cost on the selected area.
                </Text>
            </View>
            <TouchableOpacity style={styles.closeTutorial} onPress={() => {
                setShowTutorial(false);
            }}>
                <Text style={{fontSize: 18, color: '#FFF'}}>CLOSE</Text>
            </TouchableOpacity>
        </View>
            
        :
        <View style={styles.container}>
            
            { loading &&
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" />
                </View>
            }
            <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
            />
            <MapView
                style={ styles.map }
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                onRegionChange={changeRegion}
                onPress={showValues}
                onDoublePress={onLocationSelect}
            >
                {
                    mySquares.map((square) => 
                        <Polygon 
                            coordinates={[
                                {latitude: square.latitude+(square.km*0.009)/2, longitude: square.longitude+(square.km*0.009)/2},
                                {latitude: square.latitude+(square.km*0.009)/2, longitude: square.longitude-(square.km*0.009)/2},
                                {latitude: square.latitude-(square.km*0.009)/2, longitude: square.longitude-(square.km*0.009)/2},
                                {latitude: square.latitude-(square.km*0.009)/2, longitude: square.longitude+(square.km*0.009)/2},
                            ]}
                            strokeColor={'transparent'}
                            fillColor={square.color}
                        />
                    )
                }
            </MapView>
            {   mySquares.length > 0 &&
            <View style={styles.infoGradient}>
                <Text style={styles.titleGradient}>Power (W/m²/dia)</Text>
                    {powerIntervals.map((interval) => (
                        <View style={styles.intervalGradient}>
                            <Text style={styles.textInterval}>{interval.min.toFixed(2)}</Text>
                            <Text style={styles.textInterval}>-</Text>
                            <Text style={styles.textInterval}>{interval.max.toFixed(2)}</Text>
                            <View style={[styles.colorInterval, {backgroundColor: interval.color}]} />
                        </View>
                    ))}
            </View>
            }
            { showInfo &&
            <View style={[styles.infoArea, {top: Dimensions.get("window").height/2, left: (Dimensions.get("window").width/2)-75}]}>
                <Text style={styles.infoAreaText}> Power (W/m²/day): <Text style={{fontWeight: 'bold'}}>{powerSelected.toFixed(2)}</Text></Text>
                <Text style={styles.infoAreaText}> Power Line in Area: <Text style={{fontWeight: 'bold'}}>{lineSelected ? 'Yes' : 'No'}</Text> </Text>
            </View>
            }
            <View style={styles.infoLocation}>
                <View style={{flexDirection: 'row'}}>
                    <View>
                        <View>
                            <Text style={styles.textInfo}>Square Size: {kmSquare.toFixed(2)}km</Text>
                            <Slider
                                style={{width: 200, height: 40}}
                                minimumValue={0}
                                maximumValue={20}
                                value={kmSquare}
                                onValueChange={(data) => setKmSquare(data)}
                                minimumTrackTintColor="#000000"
                                maximumTrackTintColor="#000000"
                            />
                        </View>
                        <View>
                            <Text style={styles.textInfo}>Power Lines Relevance: {lineImportance.toFixed(0)}%</Text>
                            <Slider
                                style={{width: 200, height: 40}}
                                minimumValue={0}
                                maximumValue={100}
                                value={lineImportance}
                                onValueChange={changeColorSquares}
                                minimumTrackTintColor="#000000"
                                maximumTrackTintColor="#000000"
                            />
                        </View>
                    </View>
                    <TouchableOpacity onPress={cleanAll} style={{marginLeft: 20, backgroundColor: '#000', padding: 10, borderRadius: 8, alignSelf: 'flex-end'}}>
                        <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 12}}>CLEAN</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        }
        </>
    );
}

 const styles = StyleSheet.create({
    container: {
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height,
        alignItems: 'center',
        justifyContent: 'center',
      },
      map: {
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height
      },
      infoLocation: {
          position: 'absolute',
          backgroundColor: '#FFF',
          width: Dimensions.get("screen").width/1.2,
          paddingVertical: 10,
          paddingLeft: 15,
          borderRadius: 10,
          alignSelf: 'center',
          bottom: Dimensions.get("screen").height/10,
          flexDirection: 'column',
          justifyContent: 'center',
      },
      textInfo: {
          color: '#000',
          fontWeight: 'bold',
          fontSize: 16,
      },
      logo: {
        position: 'absolute',
        width: 125,
        height: 125,
        top: 0,
        left: 0,
        zIndex: 9
      },
      overlay: {
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        position: 'absolute',
        top:0,
        left:0,
        zIndex: 10
      },
      infoGradient: {
          position: 'absolute',
          width: 200,
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderRadius: 10,
          right: 10,
          top: 10,
          padding: 10,
          flexDirection: 'column',
          justifyContent: 'space-around',
      },
      intervalGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
      },
      textInterval: {
          color: '#fff',
          fontWeight: '600',
      },
      colorInterval: {
          width: 20,
          height: 20,
      },
      titleGradient: {
          color: '#fff',
          alignSelf: 'center',
          fontWeight: '600',
          marginBottom: 10,
          fontSize: 16,
      },
      infoArea: {
        position: 'absolute',
        width: 200,
        height: 75,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        justifyContent: 'space-around'
      },
      infoAreaText: {
          fontWeight: '600',
          color: '#000',
          fontSize: 12
      },
      tutorial: {
          width: Dimensions.get("screen").width,
          height: Dimensions.get("screen").height,
          flexDirection: 'column',
          alignItems: 'center',
      },
      logoTutorial: {
        width: Dimensions.get("screen").width/2,
        height: Dimensions.get("screen").width/2,
      },
      instructionsTitle: {
        backgroundColor: '#475d90',
        width: Dimensions.get("screen").width/1.5,
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
      },
      allInstructions: {
          backgroundColor: '#fff',
          width: Dimensions.get("screen").width-50,
          borderRadius: 8,
          marginTop: 20,
          padding: 10,
      },
      instruction: {
          color: '#475d90',
          fontSize: 16,
          marginTop: 10,
          lineHeight: 25,
      },
      closeTutorial: {
        marginTop: 20,
        backgroundColor: '#475d90',
        width: Dimensions.get("screen").width/3,
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
      }
});