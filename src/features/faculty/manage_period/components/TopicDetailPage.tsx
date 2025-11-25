import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb';
import { toast } from '@/hooks/use-toast';
import { useGetTopicByIdQuery } from '@/services/topicApi';
import TopicDetail from './TopicDetail';
import type { Topic } from '@/models/topic';

interface LocationState {
  breadcrumbs?: { label: string; path: string }[];
}

const TopicDetailPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateBreadcrumbs = (location.state as LocationState)?.breadcrumbs;

  const { data: topic, isLoading, error } = useGetTopicByIdQuery(topicId || '');
  const [breadcrumbs, setBreadcrumbs] = useState(
    stateBreadcrumbs ?? [
      { label: 'Trang chủ', path: '/' },
      { label: 'Quản lý đợt đăng ký', path: '/manage-period' },
      { label: 'Đang tải...', path: '#' },
      { label: 'Đang tải...', path: '#' }
    ]
  );

  // Cập nhật breadcrumb khi topic load xong nếu chưa có state
  useEffect(() => {
    if (!stateBreadcrumbs && topic) {
      setBreadcrumbs([
        { label: 'Trang chủ', path: '/' },
        { label: 'Quản lý đợt đăng ký', path: '/manage-period' },
        { label: topic.period?.name || 'Đang tải...', path: `/period/${topic.periodId}` },
        { label: topic.titleVN, path: '#' }
      ]);
    }
  }, [topic, stateBreadcrumbs]);

  // Gắn breadcrumb vào hook
  usePageBreadcrumb(breadcrumbs);

  if (isLoading) return <div>Đang tải đề tài...</div>;
  if (error || !topic) {
    toast({ title: 'Lỗi', description: 'Không thể tải đề tài.', variant: 'destructive' });
    navigate('/manage-period');
    return null;
  }

  return <TopicDetail topic={topic as Topic} />;
};

export default TopicDetailPage;
