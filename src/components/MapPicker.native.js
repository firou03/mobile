import React from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapPicker({ selectedPoint, onSelectPoint }) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{ ...selectedPoint, latitudeDelta: 0.2, longitudeDelta: 0.2 }}
      onPress={(e) => onSelectPoint(e.nativeEvent.coordinate)}
    >
      <Marker coordinate={selectedPoint} title="Point choisi" />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 220,
    borderRadius: 16,
  },
});
