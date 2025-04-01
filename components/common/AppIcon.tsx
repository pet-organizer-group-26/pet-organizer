import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function AppIcon() {
  return (
    <LinearGradient
      colors={["#007b6b", "#007b6b"]}
      style={{ 
        width: 120,
        height: 120,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
      }}
    >
      <Ionicons name="paw" size={64} color="white" />
    </LinearGradient>
  );
} 