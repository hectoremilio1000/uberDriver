import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  Button,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useMemo, useState, useEffect } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import OrderItem from "../../components/OrderItem";
import MapView, { Marker } from "react-native-maps";
import { DataStore } from "aws-amplify";
import { Order } from "../../models";

import { Entypo } from "@expo/vector-icons";

//amplify
import { Auth } from "aws-amplify";

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const bottomSheetRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const snapPoints = useMemo(() => ["12%", "95%"], []);

  const fetchOrders = () => {
    DataStore.query(Order, order =>
      order.status("eq", "READY_FOR_PICKUP")
    ).then(setOrders);
  };

  useEffect(() => {
    fetchOrders();
    const subscription = DataStore.observe(Order).subscribe(msg => {
      if (msg.opType === "UPDATE") {
        fetchOrders();
      }
      return () => subscription.unsubscribe();
    });
  }, []);

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const Salir = async () => {
    try {
      await Auth.signOut();
    } catch (error) {
      console.log("error sign out", error);
    }
  };

  if (!driverLocation) {
    return <ActivityIndicator size={"large"} color="gray" />;
  }
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "lightblue",
      }}
    >
      <MapView
        style={{
          height: height,
          width: width,
        }}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.07,
          longitudeDelta: 0.07,
        }}
        showsUserLocation
        followsUserLocation
      >
        {orders.map(order => (
          <Marker
            key={order.id}
            title={order?.Restaurant?.name}
            description={order?.Restaurant?.address}
            coordinate={{
              latitude: order?.Restaurant?.lat,
              longitude: order?.Restaurant?.lng,
            }}
          >
            <View
              style={{
                backgroundColor: "green",
                padding: 10,
                borderRadius: 20,
              }}
            >
              <Entypo name="shop" sie={24} color="white" />
            </View>
          </Marker>
        ))}
      </MapView>

      <BottomSheet ref={bottomSheetRef} snapPoints={snapPoints}>
        <View style={{ alignItems: "center", marginBottom: 30 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              letterSpacing: 0.5,
              paddingBottom: 5,
            }}
          >
            You're online
          </Text>
          <Text style={{ letterSpacing: 0.5, color: "grey" }}>
            Available orders: {orders.length}
          </Text>
          <Button title="Salir" onPress={Salir} />
        </View>
        <BottomSheetFlatList
          data={orders}
          renderItem={({ item }) => <OrderItem order={item} />}
        />
      </BottomSheet>
    </View>
  );
};

export default OrdersScreen;
