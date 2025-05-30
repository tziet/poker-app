import { StyleSheet } from "react-native";

export const googleButtonStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4",
    padding: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
