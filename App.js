import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./src/navigation";
import "react-native-gesture-handler";

export default function App() {
  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
}
