import React, { useEffect, useState } from 'react';
import {Dimensions, StyleSheet, View, Text, Image} from 'react-native'
import MapView, { Circle, Polygon, PROVIDER_GOOGLE } from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from '@react-native-community/geolocation';
import API from '../../api';


export default function Home(){
    const [myLatitude, setMyLatitude] = useState(0);
    const [myLongitude, setMyLongitude] = useState(0);
    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
    });

    const [mySquares, setMySquares] = useState([]);

    const dataExample = {
        basic: [
            420.47440910103313,
            420.47440910103313,
            420.8340101150192,
            420.29361736867463,
            420.29361736867463,
            421.7242082364432,
            420.29361736867463,
            420.29361736867463,
            421.7242082364432
        ],
    }

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
        // setMyLatitude(-21.7840006);
        // setMyLongitude(-46.5975968);
        // setRegion({
        //     latitude: -21.7840006,
        //     longitude: -46.5975968,
        //     latitudeDelta: 0.002,
        //     longitudeDelta: 0.001,
        // })
        API.get("temporal/monthly/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude="+myLongitude+"&latitude="+myLatitude+"&format=JSON&start=1981&end=2020&user=DAV")
        .then((response) => {
            console.log(response.data.times.data);
        })
        .catch((err) => {
            console.log(err);
        })
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


    const onLocationSelect = (event) => {
        let newSquares = mySquares.map((square) => square);
        let squareLatitude = event.nativeEvent.coordinate.latitude;
        let squareLongitude = event.nativeEvent.coordinate.longitude;
        let oldLatitude = 0;
        let oldLongitude = 0;
        let maxMin = [];
        
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
            latitude: squareLatitude+0.119, 
            longitude: squareLongitude-0.119, 
            value: dataExample.basic[0],
            color: colorNivel[0],
        };

        let objTopCenter = { 
            latitude: squareLatitude+0.119, 
            longitude: squareLongitude, 
            value: dataExample.basic[1],
            color: colorNivel[0],
        }

        let objTopRight = { 
            latitude: squareLatitude+0.119, 
            longitude: squareLongitude+0.119, 
            value: dataExample.basic[2],
            color: colorNivel[0],
        }

        let objLeft = { 
            latitude: squareLatitude, 
            longitude: squareLongitude-0.119, 
            value: dataExample.basic[3],
            color: colorNivel[0],
        }

        let objCenter = { 
            latitude: squareLatitude, 
            longitude: squareLongitude, 
            value: dataExample.basic[4],
            color: colorNivel[0],
        }

        let objRight = { 
            latitude: squareLatitude, 
            longitude: squareLongitude+0.119, 
            value: dataExample.basic[5],
            color: colorNivel[0],
        }

        let objBottomLeft = { 
            latitude: squareLatitude-0.119, 
            longitude: squareLongitude-0.119, 
            value: dataExample.basic[6],
            color: colorNivel[0],
        }

        let objBottomCenter = { 
            latitude: squareLatitude-0.119, 
            longitude: squareLongitude, 
            value: dataExample.basic[7],
            color: colorNivel[0],
        }

        let objBottomRight = { 
            latitude: squareLatitude-0.119, 
            longitude: squareLongitude+0.119, 
            value: dataExample.basic[8],
            color: colorNivel[0],
        }
        
        mySquares.map((square) => {
            if(
                objTopLeft.longitude > square.longitude-0.0595
                && objTopLeft.longitude < square.longitude+0.0595
                && objTopLeft.latitude > square.latitude-0.0595
                && objTopLeft.latitude < square.latitude + 0.0595
            ){
                notAdd.topleft = 1;
            }

            if(
                objTopCenter.longitude > square.longitude-0.0595
                && objTopCenter.longitude < square.longitude+0.0595
                && objTopCenter.latitude > square.latitude-0.0595
                && objTopCenter.latitude < square.latitude + 0.0595
            ){
                notAdd.topcenter = 1;
            }

            if(
                objTopRight.longitude > square.longitude-0.0595
                && objTopRight.longitude < square.longitude+0.0595
                && objTopRight.latitude > square.latitude-0.0595
                && objTopRight.latitude < square.latitude + 0.0595
            ){
                notAdd.topright = 1;
            }

            if(
                objLeft.longitude > square.longitude-0.0595
                && objLeft.longitude < square.longitude+0.0595
                && objLeft.latitude > square.latitude-0.0595
                && objLeft.latitude < square.latitude + 0.0595
            ){
                notAdd.left = 1;
            }

            if(
                objCenter.longitude > square.longitude-0.0595
                && objCenter.longitude < square.longitude+0.0595
                && objCenter.latitude > square.latitude-0.0595
                && objCenter.latitude < square.latitude + 0.0595
            ){
                notAdd.center = 1;
                oldLatitude = square.latitude;
                oldLongitude = square.longitude;
            }

            if(
                objRight.longitude > square.longitude-0.0595
                && objRight.longitude < square.longitude+0.0595
                && objRight.latitude > square.latitude-0.0595
                && objRight.latitude < square.latitude + 0.0595
            ){
                notAdd.right = 1;
            }

            if(
                objBottomLeft.longitude > square.longitude-0.0595
                && objBottomLeft.longitude < square.longitude+0.0595
                && objBottomLeft.latitude > square.latitude-0.0595
                && objBottomLeft.latitude < square.latitude + 0.0595
            ){
                notAdd.bottomleft = 1;
            }

            if(
                objBottomCenter.longitude > square.longitude-0.0595
                && objBottomCenter.longitude < square.longitude+0.0595
                && objBottomCenter.latitude > square.latitude-0.0595
                && objBottomCenter.latitude < square.latitude + 0.0595
            ){
                notAdd.bottomcenter = 1;
            }

            if(
                objBottomRight.longitude > square.longitude-0.0595
                && objBottomRight.longitude < square.longitude+0.0595
                && objBottomRight.latitude > square.latitude-0.0595
                && objBottomRight.latitude < square.latitude + 0.0595
            ){
                notAdd.bottomright = 1;
            }
        })

        if(notAdd.center){
            objTopLeft = { 
                latitude: oldLatitude+0.119, 
                longitude: oldLongitude-0.119, 
                value: dataExample.basic[0],
                color: colorNivel[0],
            };
    
            objTopCenter = { 
                latitude: oldLatitude+0.119, 
                longitude: oldLongitude, 
                value: dataExample.basic[1],
                color: colorNivel[0],
            }
    
            objTopRight = { 
                latitude: oldLatitude+0.119, 
                longitude: oldLongitude+0.119, 
                value: dataExample.basic[2],
                color: colorNivel[0],
            }
    
            objLeft = { 
                latitude: oldLatitude, 
                longitude: oldLongitude-0.119, 
                value: dataExample.basic[3],
                color: colorNivel[0],
            }
    
            objCenter = { 
                latitude: oldLatitude, 
                longitude: oldLongitude, 
                value: dataExample.basic[4],
                color: colorNivel[0],
            }
    
            objRight = { 
                latitude: oldLatitude, 
                longitude: oldLongitude+0.119, 
                value: dataExample.basic[5],
                color: colorNivel[0],
            }
    
            objBottomLeft = { 
                latitude: oldLatitude-0.119, 
                longitude: oldLongitude-0.119, 
                value: dataExample.basic[6],
                color: colorNivel[0],
            }
    
            objBottomCenter = { 
                latitude: oldLatitude-0.119, 
                longitude: oldLongitude, 
                value: dataExample.basic[7],
                color: colorNivel[0],
            }
    
            objBottomRight = { 
                latitude: oldLatitude-0.119, 
                longitude: oldLongitude+0.119, 
                value: dataExample.basic[8],
                color: colorNivel[0],
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

        maxMin = maxMinValue(newSquares);

        let interval = (maxMin[0] - maxMin[1])/9;
        let allIntervals = [];
        let squareWithColors = [];
        for(let i = 0; i < 9; i++){
            allIntervals.push(
                {min: maxMin[1]+(interval * i), max: maxMin[1]+(interval* (i+1))}
            )
        }
        for(let i = 0; i< 9; i++){
            newSquares = newSquares.map((square) => {
                if(square.value >= allIntervals[i].min && square.value <= allIntervals[i].max){
                    square.color = colorNivel[i];
                }
                return square;
            })
        }
        
        setMySquares(newSquares);
    }

    return (    
        <View style={styles.container}>
            <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
            />
            <MapView
                style={ styles.map }
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                onRegionChange={changeRegion}
                onPress={onLocationSelect}
            >
                {
                    mySquares.map((square) => 
                        <Polygon 
                            coordinates={[
                                {latitude: square.latitude+0.0595, longitude: square.longitude+0.0595},
                                {latitude: square.latitude+0.0595, longitude: square.longitude-0.0595},
                                {latitude: square.latitude-0.0595, longitude: square.longitude-0.0595},
                                {latitude: square.latitude-0.0595, longitude: square.longitude+0.0595},
                            ]}
                            strokeColor={'transparent'}
                            fillColor={square.color}
                        />
                    )
                }
            </MapView>
            <View style={styles.infoLocation}>
                <View>
                    <Text style={styles.textInfo}>Latitude: {region.latitude.toFixed(4)}</Text>
                    <Text style={styles.textInfo}>Longitude: {region.longitude.toFixed(4)}</Text>
                </View>
            </View>
        </View>
    );
}

 const styles = StyleSheet.create({
    container: {
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height,
      },
      map: {
        width: Dimensions.get("screen").width,
        height: Dimensions.get("screen").height
      },
      infoLocation: {
          position: 'absolute',
          backgroundColor: '#FFF',
          width: Dimensions.get("screen").width/1.2,
          height: 75,
          borderRadius: 10,
          alignSelf: 'center',
          bottom: Dimensions.get("screen").height/10,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
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
        right: 0,
        zIndex: 10
      }
});