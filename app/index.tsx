import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-5xl text-dark-200 font-bold">Poker!</Text>
      <Link href="/onboarding">Onboarding</Link>
      {/*<Link href="/player/Yonatan">Yonatan</Link>*/}
    </View>
  );
}
