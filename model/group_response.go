package model

type GroupResponse struct {
	Group *Group `json:"group"`
	User  *User  `json:"user"`
}

func NewGroupResponse(group *Group, user *User) *GroupResponse {
	return &GroupResponse{
		Group: group,
		User:  user,
	}
}
