import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-secondary-500";
    case "danger":
      return "bg-danger-500";
    case "success":
      return "bg-success-500";
    case "outline":
      return "bg-transparent border-neutral-300 border-[0.5px]";
    default:
      return "bg-primary-500";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-gray-100";
    case "danger":
      return "text-red-100";
    case "success":
      return "text-green-100";
    default:
      return "text-white";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  isLoading,
  loadingText = "Please wait...",
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full rounded-full flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${className} ${isLoading ? "opacity-50" : ""} ${bgVariant !== "primary" ? getBgVariantStyle(bgVariant) : ""}`}
      disabled={isLoading}
      {...props}
    >
      {bgVariant === "primary" ? (
        <LinearGradient
          colors={["#9D00FF", "#5E0099"]}
          className="w-full flex flex-row items-center justify-center p-3 rounded-full"
        >
          {IconLeft && <IconLeft />}
          <Text
            className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}
          >
            {isLoading ? loadingText : title}
          </Text>
          {IconRight && <IconRight />}
        </LinearGradient>
      ) : (
        <>
          {IconLeft && <IconLeft />}
          <Text
            className={`text-lg font-bold ${getTextVariantStyle(textVariant)} p-3`}
          >
            {isLoading ? loadingText : title}
          </Text>
          {IconRight && <IconRight />}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
