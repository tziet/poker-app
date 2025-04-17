import { Image, ScrollView, Text, View } from "react-native";
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";

export default function Index() {
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />
      <Image source={icons.logo} className="w-full h-full" />
    </View>
  );
}
