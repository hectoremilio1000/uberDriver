import {
  View,
  Text,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useRef, useMemo, useEffect, useState } from "react";

import BottomSheet from "@gorhom/bottom-sheet";
import {
  FontAwesome5,
  Fontisto,
  Entypo,
  MaterialIcons,
  Ionicons,
} from "@expo/vector-icons";

import orders from "../../../assets/data/orders.json";
import styles from "./styles";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import { useNavigation } from "@react-navigation/native";

const order = orders[0];

const ORDER_STATUSES = {
  READY_FOR_PICK_UP: "READY_FOR_PICK_UP",
  ACCEPTED: "ACCEPTED",
  PICKED_UP: "PICKED_UP",
};

const restaurantLocation = {
  latitude: order.Restaurant.lat,
  longitude: order.Restaurant.lng,
};

const deliveryLocation = {
  latitude: order.User.lat,
  longitude: order.User.lng,
};
const OrderDelivery = () => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [deliveryStatus, setDeliveryStatus] = useState(
    ORDER_STATUSES.READY_FOR_PICK_UP
  );
  const [isDriverClose, setIsDriverClose] = useState(false);

  const bottomSheetRef = useRef(null);
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const snapPoints = useMemo(() => ["12%", "95%", []]);
  const navigation = useNavigation();

  useEffect(() => {
    const getDeliveryLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (!status === "granted") {
        console.log("Nonono");
        return;
      }

      let location = await Location.getCurrentPositionAsync();
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };
    getDeliveryLocation();

    const foregroundSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 500,
      },
      updatedLocation => {
        setDriverLocation({
          latitude: updatedLocation.coords.latitude,
          longitude: updatedLocation.coords.longitude,
        });
      }
    );
    return foregroundSubscription;
  }, []);

  if (!driverLocation) {
    return <ActivityIndicator size="small" color="black" />;
  }

  const onButtonPress = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP) {
      bottomSheetRef.current?.collapse();
      mapRef.current.animateToRegion({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setDeliveryStatus(ORDER_STATUSES.ACCEPTED);
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED) {
      bottomSheetRef.current?.collapse();
      setDeliveryStatus(ORDER_STATUSES.PICKED_UP);
    }
    if (deliveryStatus === ORDER_STATUSES.PICKED_UP) {
      bottomSheetRef.current?.collapse();
      navigation.navigate.goBack();
      console.warn("Delivery finished");
    }
  };

  const renderButtonTitle = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP) {
      return "Accept Order";
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED) {
      return "Pick-up Order";
    }
    if (deliveryStatus === ORDER_STATUSES.PICKED_UP) {
      return "Complete Delivery";
    }
  };

  const isButtonDisabled = () => {
    if (deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP) {
      return false;
    }
    if (deliveryStatus === ORDER_STATUSES.ACCEPTED && isDriverClose) {
      return false;
    }
    if (deliveryStatus === ORDER_STATUSES.PICKED_UP && isDriverClose) {
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={{
          height: height,
          width: width,
        }}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: driverLocation?.latitude,
          longitude: driverLocation?.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
      >
        <MapViewDirections
          origin={driverLocation}
          destination={
            deliveryStatus === ORDER_STATUSES.ACCEPTED
              ? restaurantLocation
              : deliveryLocation
          }
          strokeWidth={10}
          waypoints={
            deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP
              ? [restaurantLocation]
              : []
          }
          strokeColor="#3fc060"
          apikey={"AIzaSyCBYBnvoLhLMJelssQZMHQOmSM_BwpXras"}
          onReady={result => {
            {
              setIsDriverClose(result.distance <= 0.1);
            }
            setTotalMinutes(result.duration);
            setTotalKm(result.distance);
          }}
        />
        <Marker
          coordinate={{
            latitude: order.Restaurant.lat,
            longitude: order.Restaurant.lng,
          }}
          title={order.Restaurant.name}
          description={order.Restaurant.address}
        >
          <View
            style={{
              backgroundColor: "green",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <Entypo name="shop" size={30} color="white" />
          </View>
        </Marker>
        <Marker
          coordinate={{
            latitude: order.User.lat,
            longitude: order.User.lng,
          }}
          title={order.User.name}
          description={order.User.address}
        >
          <View
            style={{
              backgroundColor: "green",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <MaterialIcons name="restaurant" size={30} color="white" />
          </View>
        </Marker>
      </MapView>
      {deliveryStatus === ORDER_STATUSES.READY_FOR_PICK_UP && (
        <Ionicons
          onPress={() => navigation.goBack()}
          name="arrow-back-circle"
          size={45}
          color="black"
          style={{ top: 40, left: 15, position: "absolute" }}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["12%", "95%"]}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={styles.handleIndicatorContainer}>
          <Text style={styles.routeDetailsText}>
            {totalMinutes.toFixed(0)} min
          </Text>
          <FontAwesome5
            name="shopping-bag"
            size={30}
            style={{ color: "#3fc060", marginHorizontal: 10 }}
          />
          <Text style={styles.routeDetailsText}>{totalKm.toFixed(2)} km</Text>
        </View>
        <View style={styles.deliveryDetailsContainer}>
          <Text style={styles.restaurantName}>{order.Restaurant.name}</Text>
          <View style={styles.adressContainer}>
            <Fontisto name="shopping-store" size={22} color="grey" />
            <Text style={styles.adressText}>{order.Restaurant.address}</Text>
          </View>
          <View style={styles.adressContainer}>
            <FontAwesome5 name="map-marker-alt" size={22} color="grey" />
            <Text style={styles.adressText}>{order.User.address}</Text>
          </View>
          <View style={styles.orderDetailsContainer}>
            <Text style={styles.orderItemText}>Onion Rings x1</Text>
            <Text style={styles.orderItemText}>Big mac x2</Text>
            <Text style={styles.orderItemText}>big tasty x2</Text>
            <Text style={styles.orderItemText}>coca cola x1</Text>
          </View>
        </View>
        <Pressable
          style={{
            ...styles.buttonContainer,
            backgroundColor: isButtonDisabled() ? "grey" : "#3fc060",
          }}
          onPress={onButtonPress}
          disabled={isButtonDisabled()}
        >
          <Text style={styles.buttonText}>{renderButtonTitle()}</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
};

export default OrderDelivery;