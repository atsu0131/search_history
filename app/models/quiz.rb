class Quiz < ApplicationRecord
    validates :q_title, presence: true,length: { maximum: 30 }
    validates :q_content, presence: true,length: { maximum: 200 }
    validates :q_answer1, presence: true,length: { maximum: 50 }
    validates :q_answer2, presence: true,length: { maximum: 50 }
    validates :q_correct, presence: true,length: { maximum: 50 }
end
