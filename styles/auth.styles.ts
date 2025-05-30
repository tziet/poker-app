import { StyleSheet } from "react-native";

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#0F0D23",
  },
  input: {
    borderWidth: 1,
    borderColor: "#2D2A47",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: "white",
    backgroundColor: "#1E1B38",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#1E1B38",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  text: {
    color: "white",
  },
  link: {
    color: "#4E8EF7",
    marginLeft: 5,
  },
  registerButton: {
    backgroundColor: "#2D2A47",
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 100,
  },
});
