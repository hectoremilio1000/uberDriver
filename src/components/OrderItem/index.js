import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Entypo } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { User } from "../../models";
import { DataStore } from "aws-amplify";

const OrderItem = ({ order }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    DataStore.query(User, order.userID).then(setUser);
  }, []);
  return (
    <Pressable
      style={{
        flexDirection: "row",
        borderColor: "#3FC060",
        borderWidth: 2,
        borderRadius: 12,
        margin: 10,
      }}
      onPress={() =>
        navigation.navigate("OrdersDeliveryScreen", { id: order.id })
      }
    >
      <Image
        source={{ uri: order?.Restaurant?.image }}
        style={{
          width: "25%",
          height: "100%",
          borderBottomLeftRadius: 10,
          borderTopLeftRadius: 10,
        }}
      />
      <View style={{ marginLeft: 10, flex: 1, paddingVertical: 5 }}>
        <Text style={{ fontSize: 16, fontWeight: "500" }}>
          {order?.Restaurant?.name}
        </Text>
        <Text style={{ color: "grey" }}>{order?.Restaurant?.address}</Text>
        <Text style={{ marginTop: 10 }}>Delivery details:</Text>
        <Text style={{ color: "grey" }}>{user?.name}</Text>
        <Text style={{ color: "grey" }}>{user?.address}</Text>
      </View>
      <View
        style={{
          padding: 5,
          backgroundColor: "#3fc060",
          borderBottomRightRadius: 10,
          borderTopRightRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Entypo
          name="check"
          size={30}
          color="white"
          style={{ marginLeft: "auto" }}
        />
      </View>
    </Pressable>
  );
};

export default OrderItem;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
