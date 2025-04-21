import { Image, View } from "react-native";
import { icons } from "@/constants/icons";

export default function Index() {
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={icons.logo}
        className="w-12 h-10 mt-20 mb-5 mx-auto self-center"
        resizeMode="contain"
        tintColor="white"
      />
    </View>
  );
}
