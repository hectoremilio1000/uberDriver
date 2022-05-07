import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./src/navigation";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Amplify } from "aws-amplify";
import awsconfig from "./src/aws-exports";
Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: true,
  },
});

import { withAuthenticator } from "aws-amplify-react-native";

import AuthContextProvider from "./src/contexts/AuthContext";
import OrderContextProvider from "./src/contexts/OrderContext";

function App() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthContextProvider>
          <OrderContextProvider>
            <Navigation />
          </OrderContextProvider>
        </AuthContextProvider>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}

export default withAuthenticator(App);
