import { View, Text, FlatList, useWindowDimensions } from "react-native";
import React, { useRef, useMemo } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import orders from "../../../assets/data/orders.json";
import OrderItem from "../../components/OrderItem";
import MapView, { Marker } from "react-native-maps";

import { Entypo } from "@expo/vector-icons";

const OrdersScreen = () => {
  const bottomSheetRef = useRef(null);
  const { width, height } = useWindowDimensions();

  const snapPoints = useMemo(() => ["12%", "95%"], []);

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
          latitude: 19.415739,
          longitude: -99.170135,
          latitudeDelta: 0.04,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        followsUserLocation
      >
        {orders.map(order => (
          <Marker
            key={order.id}
            title={order.Restaurant.name}
            description={order.Restaurant.address}
            coordinate={{
              latitude: order.Restaurant.lat,
              longitude: order.Restaurant.lng,
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
        <View style={{ flex: 1, alignItems: "center", marginBottom: 30 }}>
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
        </View>
        <FlatList
          data={orders}
          renderItem={({ item }) => <OrderItem order={item} />}
        />
      </BottomSheet>
    </View>
  );
};

export default OrdersScreen;
