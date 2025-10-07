
import TaskItem from './common/TaskItem';
import { TaskCardProps } from '../types';

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return <TaskItem task={task} />;
};

export default TaskCard;
