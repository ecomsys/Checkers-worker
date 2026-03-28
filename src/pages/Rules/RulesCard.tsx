import { motion } from "framer-motion";

type Props = {
  index: number;
  title: string;
  description: string;
};

export const RulesCard = ({ index, title, description }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
};
