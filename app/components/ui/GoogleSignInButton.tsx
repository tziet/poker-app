import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { googleButtonStyles } from "@/styles/googleButton.styles";

interface GoogleSignInButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={googleButtonStyles.button}
      onPress={onPress}
      disabled={disabled}
    >
      <AntDesign
        name="google"
        size={24}
        color="white"
        style={googleButtonStyles.icon}
      />
      <Text style={googleButtonStyles.text}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;
