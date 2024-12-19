import { TwitterIcon } from "lucide-react";
import { Tweet } from "react-tweet";
import { motion } from "framer-motion";

interface Tweet {
  id: string;
  url: string;
  title: string;
  author: string | null;
}

interface RecentTweetsDisplayProps {
  tweets: Tweet[];
}

export default function RecentTweetsDisplay({ tweets }: RecentTweetsDisplayProps) {
  if (!tweets || tweets.length === 0) return null;

  return (
    <div className="mt-10 w-full">
      {/* <h3 className="text-xl font-semibold mb-3 ml-1">
        Recent Tweets
      </h3> */}

      <div className="w-full overflow-x-auto py-6">
        <motion.div
          className="flex space-x-6 pb-6"
          drag="x"
          dragConstraints={{ left: -((tweets.length * 400) - window.innerWidth), right: 0 }}
          dragElastic={0.3}
        >
          {tweets.map((tweet, index) => (
            <motion.div
              key={tweet.id}
              className="flex-shrink-0 w-[350px]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              data-theme="light"
            >
              <Tweet 
                id={tweet.id.split('/').pop() || ''} 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
} 