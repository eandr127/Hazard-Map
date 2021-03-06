/**
 * Sample React Native App with Firebase
 * https://github.com/invertase/react-native-firebase
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import Geolocation from 'react-native-geolocation-service';
import BottomBar from './components/BottomBar';
import DownloadedHazard from './components/DownloadedHazard'

import PlacementHazard from './components/PlacementHazard';
import firestore from '@react-native-firebase/firestore';

import firebase from "@react-native-firebase/app"
import { Marker } from 'react-native-maps';
const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\nCmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\nShake or press menu button for dev menu"
});

const firebaseCredentials = Platform.select({
  ios: "https://invertase.link/firebase-ios",
  android: "https://invertase.link/firebase-android"
});

type Props = {};

type State = {
        latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
      mode: boolean;
      markers: array;
}


const mapping = {"other": "Other", "geese": "Goose", "fallen-trees": "Fallen Tree", "potholes": "Pothole", "ice": "Ice"}

export default class App extends Component<Props, State> {
  

  constructor(props) {
    super(props);
    this.setMode = this.setMode.bind(this);
    this.setSelected = this.setSelected.bind(this);
    this.recieveSnapshot = this.recieveSnapshot.bind(this);
    this.ref = firestore().collection("DATA")

    this.state = {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      mode: true,
      selected: null,
      markers: []
    }
  }

  recieveSnapshot(querySnapshot) {
  const fetched = []
  querySnapshot.forEach((doc) => fetched.push(doc.data()));

  this.setState({...this.state, markers: fetched})
  }

  componentDidMount() {
    this.ref.onSnapshot(this.recieveSnapshot)
    this.ref.get().then(this.recieveSnapshot);

        Geolocation.getCurrentPosition(
            (position) => {
              console.log(position)
                this.setState(position.coords);
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    
  }

  setMode(mode) {this.setState({...this.state, mode})}
  setSelected(selected) {this.setState({...this.state, selected})}

  render() {
    return (
      <View style={styles.overContainer}>
         <MapView
         onPress={async (event) => {
           if(this.state.selected) {
             // Send hazard here
             console.log(this.state.selected, event.nativeEvent.coordinate)

             await this.ref.add({
      hazardType: mapping[this.state.selected],
      location: {
        _longitude: event.nativeEvent.coordinate.longitude,
        _latitude: event.nativeEvent.coordinate.latitude
      },
    });
             

             this.setState({...this.state, mode: true, selected: null})
           }
         }}
        style={styles.container}
        region={this.state} >{this.state.markers.map((marker, idx) => (<DownloadedHazard {...marker} key={idx} />) )}</MapView>
        <PlacementHazard visible={!this.state.mode} setSelected={this.setSelected} image={require("./assets/ice.png")} name="ice"  left={2.5}/>
        <PlacementHazard visible={!this.state.mode} setSelected={this.setSelected} image={require("./assets/potholes.png")} name="potholes" left={22.5}/>
        <PlacementHazard visible={!this.state.mode} setSelected={this.setSelected} image={require("./assets/fallen-trees.png")} name="fallen-trees" left={42.5}/>
        <PlacementHazard visible={!this.state.mode} setSelected={this.setSelected} image={require("./assets/geese.png")} name="geese" left={62.5}/>
        <PlacementHazard visible={!this.state.mode} setSelected={this.setSelected} image={require("./assets/other.png")} name="other" left={82.5}/>
        <View style={styles.bottom}>
          <BottomBar mode={this.state.mode} setMode={this.setMode}/>
        </View>
        </View>
      
    );
  }
}

const styles = StyleSheet.create({
  overContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  container: {
    flexGrow: 2,
    width: "100%",
    backgroundColor: "#F5CCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  bottom: {
    width: "100%",
    backgroundColor: "#ff0000",
    justifyContent: "center"
  }
});
